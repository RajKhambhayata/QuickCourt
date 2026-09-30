import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const outlets = await prisma.partnerOutlet.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const parsedOutlets = outlets.map((outlet) => {
      let menu = [];
      try {
        menu = JSON.parse(outlet.menuItems);
      } catch (e) {
        menu = [];
      }

      let rules = {};
      try {
        rules = JSON.parse(outlet.offerRules);
      } catch (e) {
        rules = {};
      }

      return {
        ...outlet,
        menuItems: menu,
        offerRules: rules,
      };
    });

    return NextResponse.json({
      success: true,
      outlets: parsedOutlets,
    });
  } catch (error) {
    console.error('Error fetching partner outlets:', error);
    return NextResponse.json({ error: 'Failed to retrieve food court partners' }, { status: 500 });
  }
}
