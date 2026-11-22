const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createQuickCourtPresentation() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 inches
  pres.author = 'QuickCourt Team';
  pres.company = 'QuickCourt';
  pres.title = 'QuickCourt — Smarter Sports & Turf Booking Platform';

  // Warm, modern athletic color palette
  const C = {
    darkGreen: '173D2B',
    lime: 'D5E69A',
    cream: 'F7F3E8',
    pureWhite: 'FFFFFF',
    charcoal: '1C2826',
    mutedGreen: '4A6B5B',
    subText: '556B5C',
    cardBg: 'FFFFFF',
    cardBorder: 'E2E8D8',
    cardBorderHover: 'A4C28D',
    accentOrange: 'E06D3B',
    accentBlue: '2563EB',
    badgeBg: 'EAF2DE',
    pillText: '173D2B'
  };

  // Helper for slide headers
  function addHeader(slide, category, title) {
    slide.background = { color: C.cream };

    // Top decorative bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.12,
      fill: { color: C.darkGreen },
      line: { color: C.darkGreen },
    });

    // Eyebrow tag
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.45,
      w: 10,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: C.mutedGreen,
      charSpacing: 2,
    });

    // Main Slide Title
    slide.addText(title, {
      x: 0.8,
      y: 0.75,
      w: 11.5,
      h: 0.7,
      fontSize: 24,
      fontFace: 'Georgia',
      bold: true,
      color: C.charcoal,
    });
  }

  // Helper for footer (NO shortcut keys, clean page number & brand)
  function addFooter(slide, pageNum) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.8,
      y: 7.0,
      w: 11.73,
      h: 0.02,
      fill: { color: C.cardBorder },
      line: { color: C.cardBorder }
    });

    slide.addText('QuickCourt  •  Modern Sports Venue & Turf Experience', {
      x: 0.8,
      y: 7.05,
      w: 8.0,
      h: 0.35,
      fontSize: 9,
      fontFace: 'Arial',
      color: C.subText,
    });

    slide.addText(`Slide ${pageNum} of 10`, {
      x: 10.0,
      y: 7.05,
      w: 2.53,
      h: 0.35,
      fontSize: 9,
      fontFace: 'Arial',
      align: 'right',
      bold: true,
      color: C.darkGreen,
    });
  }

  // ==========================================
  // SLIDE 1: Title & Welcome
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.darkGreen };

    // Accent header pill
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: 1.2,
      w: 3.2,
      h: 0.45,
      fill: { color: C.lime },
      line: { color: C.lime },
      rectRadius: 0.2,
    });
    slide.addText('SPORTS • LEISURE • REWARDS', {
      x: 1.0,
      y: 1.2,
      w: 3.2,
      h: 0.45,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: C.darkGreen,
      align: 'center',
      valign: 'middle',
    });

    // Main App Title
    slide.addText('QuickCourt', {
      x: 0.95,
      y: 1.8,
      w: 11.0,
      h: 1.3,
      fontSize: 54,
      fontFace: 'Georgia',
      bold: true,
      color: C.lime,
    });

    // Subtitle
    slide.addText('The All-in-One Turf & Arena Booking Experience', {
      x: 1.0,
      y: 3.1,
      w: 11.0,
      h: 0.6,
      fontSize: 22,
      fontFace: 'Arial',
      color: C.cream,
    });

    // High level value summary
    slide.addText('From evening badminton matches to weekend Go-Karting heats and pre-ordered post-match smoothies — QuickCourt connects passionate players with premier sports facilities in seconds.', {
      x: 1.0,
      y: 3.8,
      w: 10.5,
      h: 1.0,
      fontSize: 14,
      fontFace: 'Arial',
      color: 'B8CDBA',
      lineSpacing: 22,
    });

    // 3 Feature Highlight Boxes
    const highlights = [
      { icon: '🏸', title: 'Instant Court Booking', desc: 'Real-time slot calendar with 0 double bookings' },
      { icon: '🏎️', title: 'Go-Karting Heats', desc: 'Pick your track, kart class & race schedule' },
      { icon: '🥤', title: 'Food & Coin Rewards', desc: 'Pre-order shakes & earn 1 Coin = ₹1 cash discount' },
    ];

    highlights.forEach((h, idx) => {
      const x = 1.0 + idx * 3.8;
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x,
        y: 5.1,
        w: 3.5,
        h: 1.4,
        fill: { color: '204D37' },
        line: { color: '306349', width: 1 },
        rectRadius: 0.15,
      });

      slide.addText(h.icon, {
        x: x + 0.2,
        y: 5.25,
        w: 0.6,
        h: 0.5,
        fontSize: 20,
      });

      slide.addText(h.title, {
        x: x + 0.85,
        y: 5.25,
        w: 2.4,
        h: 0.4,
        fontSize: 13,
        fontFace: 'Arial',
        bold: true,
        color: C.lime,
      });

      slide.addText(h.desc, {
        x: x + 0.85,
        y: 5.65,
        w: 2.4,
        h: 0.7,
        fontSize: 10,
        fontFace: 'Arial',
        color: C.cream,
        lineSpacing: 14,
      });
    });
  }

  // ==========================================
  // SLIDE 2: The Real-World Problem
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Current Market Frustration', 'The Problem: Booking a Turf Today is Chaos');

    // Context description
    slide.addText('Sports enthusiasts lose hours every weekend trying to organize a single game with friends:', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      color: C.subText,
    });

    const problems = [
      {
        num: '01',
        title: 'Endless Calling & WhatsApp',
        desc: 'Managers do not answer phones during peak hours. Players spend 45 minutes messaging multiple venues just to see if a 7 PM slot is free.',
        impact: 'Wasted time & frustrated players'
      },
      {
        num: '02',
        title: 'Clashing & Double Bookings',
        desc: 'Venues write bookings down in paper diaries. Two groups frequently arrive at the same court at 8 PM, leading to heated arguments.',
        impact: 'Ruined weekend plans'
      },
      {
        num: '03',
        title: 'Opaque Prices & Cash Hassle',
        desc: 'Weekend surge pricing is hidden. Split payments require endless UPI screenshots and awkward payment reminders among friends.',
        impact: 'Payment friction & awkward splits'
      },
      {
        num: '04',
        title: 'Zero Post-Game Amenities',
        desc: 'Thirsty players stand in long food lines after intense 60-minute matches or discover the cafe is out of water and protein snacks.',
        impact: 'Disjointed player experience'
      }
    ];

    problems.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.95;
      const y = 2.05 + row * 2.35;

      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x,
        y: y,
        w: 5.65,
        h: 2.15,
        fill: { color: C.pureWhite },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.15,
      });

      // Number badge
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.3,
        y: y + 0.25,
        w: 0.7,
        h: 0.4,
        fill: { color: 'FEE2E2' },
        line: { color: 'FCA5A5', width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(p.num, {
        x: x + 0.3,
        y: y + 0.25,
        w: 0.7,
        h: 0.4,
        fontSize: 12,
        fontFace: 'Arial',
        bold: true,
        color: '991B1B',
        align: 'center',
        valign: 'middle'
      });

      // Title
      slide.addText(p.title, {
        x: x + 1.15,
        y: y + 0.25,
        w: 4.2,
        h: 0.4,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: C.charcoal,
      });

      // Desc
      slide.addText(p.desc, {
        x: x + 0.3,
        y: y + 0.75,
        w: 5.0,
        h: 0.85,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.subText,
        lineSpacing: 16,
      });

      // Impact tag
      slide.addText(`Impact: ${p.impact}`, {
        x: x + 0.3,
        y: y + 1.65,
        w: 5.0,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Arial',
        italic: true,
        bold: true,
        color: 'B91C1C',
      });
    });

    addFooter(slide, 2);
  }

  // ==========================================
  // SLIDE 3: The Solution
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'The QuickCourt Advantage', 'The Solution: 1-Tap Booking, 100% Guaranteed');

    slide.addText('QuickCourt replaces paper diaries and phone calls with a polished, synchronized web app that works effortlessly on phones and laptops:', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      color: C.subText,
    });

    const solutions = [
      {
        icon: '⚡',
        title: 'Live Court Availability',
        desc: 'Pick your sport, choose your preferred venue, and view exact open slots in real-time. What you see is guaranteed free.',
        tag: 'Instant Confirmation'
      },
      {
        icon: '🛡️',
        title: 'Zero Double Bookings',
        desc: 'Automated atomic database reservations ensure that once you begin booking, the slot is locked and cannot be taken by anyone else.',
        tag: 'Conflict-Free'
      },
      {
        icon: '🍔',
        title: 'Integrated Pre-Orders',
        desc: 'Select energy drinks, snacks, and electrolyte water to be chilled and waiting court-side when your 60-minute buzzer rings.',
        tag: 'Match-Ready'
      },
      {
        icon: '💰',
        title: 'Earn While You Play',
        desc: 'Every game earns Court Coins in your digital wallet. 1 Coin = ₹1 flat discount on any future court or food order.',
        tag: 'Real Savings'
      }
    ];

    solutions.forEach((s, idx) => {
      const x = 0.8 + idx * 2.95;
      const y = 2.1;

      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x,
        y: y,
        w: 2.8,
        h: 4.6,
        fill: { color: C.pureWhite },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.2,
      });

      // Top icon circle
      slide.addShape(pres.shapes.OVAL, {
        x: x + 0.3,
        y: y + 0.35,
        w: 0.85,
        h: 0.85,
        fill: { color: C.badgeBg },
        line: { color: C.lime, width: 1 }
      });
      slide.addText(s.icon, {
        x: x + 0.3,
        y: y + 0.35,
        w: 0.85,
        h: 0.85,
        fontSize: 20,
        align: 'center',
        valign: 'middle'
      });

      // Tag
      slide.addText(s.tag.toUpperCase(), {
        x: x + 0.3,
        y: y + 1.35,
        w: 2.2,
        h: 0.25,
        fontSize: 8.5,
        fontFace: 'Arial',
        bold: true,
        color: C.mutedGreen,
        charSpacing: 1,
      });

      // Title
      slide.addText(s.title, {
        x: x + 0.3,
        y: y + 1.65,
        w: 2.2,
        h: 0.65,
        fontSize: 14,
        fontFace: 'Georgia',
        bold: true,
        color: C.charcoal,
      });

      // Desc
      slide.addText(s.desc, {
        x: x + 0.3,
        y: y + 2.4,
        w: 2.2,
        h: 1.8,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.subText,
        lineSpacing: 17,
      });
    });

    addFooter(slide, 3);
  }

  // ==========================================
  // SLIDE 4: Real-World Example - Booking Flow
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Real-World Walkthrough', 'Example: Booking a 7 PM Badminton Match');

    slide.addText('Meet Rahul — he wants to play badminton with 3 college friends this Friday evening. Here is his 60-second journey:', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: C.subText,
    });

    const steps = [
      {
        step: 'Step 1: Explore',
        time: '0:05s',
        desc: 'Rahul opens QuickCourt on his phone, filters by "Badminton" in his neighborhood, and selects "Smash Arena" with synthetic indoor courts.',
        color: C.mutedGreen
      },
      {
        step: 'Step 2: Choose Slot',
        time: '0:20s',
        desc: 'He taps Friday, sees the 19:00 - 20:00 slot highlighted green on Court 1 (₹590/hr). He taps to reserve the slot instantly.',
        color: C.mutedGreen
      },
      {
        step: 'Step 3: Add Refreshments',
        time: '0:35s',
        desc: 'QuickCourt suggests 2 Tender Coconut Waters and 2 Protein Energy Bars from the CourtSide Cafe for ₹180. He adds them with 1 tap.',
        color: C.mutedGreen
      },
      {
        step: 'Step 4: Redeem & Confirm',
        time: '0:50s',
        desc: 'At checkout, Rahul toggles "Apply 50 Court Coins" to get ₹50 off. Booking reference QC-2026-1P7SUA2D is generated immediately.',
        color: C.accentOrange
      }
    ];

    steps.forEach((st, idx) => {
      const x = 0.8 + idx * 2.95;
      const y = 2.1;

      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x,
        y: y,
        w: 2.8,
        h: 4.6,
        fill: { color: C.pureWhite },
        line: { color: idx === 3 ? 'FDBA74' : C.cardBorder, width: idx === 3 ? 2 : 1 },
        rectRadius: 0.15,
      });

      // Step header pill
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.25,
        y: y + 0.25,
        w: 2.3,
        h: 0.4,
        fill: { color: idx === 3 ? 'FFEDD5' : C.badgeBg },
        line: { color: idx === 3 ? 'FDBA74' : C.lime, width: 1 },
        rectRadius: 0.1,
      });

      slide.addText(`${st.step}  •  ${st.time}`, {
        x: x + 0.25,
        y: y + 0.25,
        w: 2.3,
        h: 0.4,
        fontSize: 9.5,
        fontFace: 'Arial',
        bold: true,
        color: idx === 3 ? 'C2410C' : C.darkGreen,
        align: 'center',
        valign: 'middle'
      });

      // Narrative text
      slide.addText(st.desc, {
        x: x + 0.3,
        y: y + 0.85,
        w: 2.2,
        h: 2.2,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.charcoal,
        lineSpacing: 17,
      });

      // Key Benefit Box
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.25,
        y: y + 3.3,
        w: 2.3,
        h: 1.0,
        fill: { color: C.cream },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1,
      });

      const benefits = [
        'No phone calls needed',
        'Slot locked in 1 tap',
        'Snacks ready upon arrival',
        'Ticket & QR code ready'
      ];

      slide.addText(`✓ ${benefits[idx]}`, {
        x: x + 0.35,
        y: y + 3.45,
        w: 2.1,
        h: 0.7,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: C.darkGreen,
        valign: 'middle'
      });
    });

    addFooter(slide, 4);
  }

  // ==========================================
  // SLIDE 5: Go-Karting & Motor Racing
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'High-Speed Excitement', 'Go-Karting: Heat Formats & Pit Lane Scheduling');

    slide.addText('Beyond regular turf sports, QuickCourt features a dedicated motor racing hub for Go-Karting tracks:', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: C.subText,
    });

    // Left card: Velocity Circuit Track Info
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 2.05,
      w: 5.65,
      h: 4.65,
      fill: { color: C.pureWhite },
      line: { color: C.cardBorder, width: 1 },
      rectRadius: 0.15,
    });

    slide.addText('🏎️ Velocity Circuit — Asphalt Sprint Track', {
      x: 1.1,
      y: 2.3,
      w: 5.0,
      h: 0.4,
      fontSize: 15,
      fontFace: 'Georgia',
      bold: true,
      color: C.charcoal,
    });

    slide.addText('850m championship track with 11 technical corners, high-speed straights, and modern electric karts with instantaneous torque.', {
      x: 1.1,
      y: 2.75,
      w: 5.0,
      h: 0.7,
      fontSize: 11,
      fontFace: 'Arial',
      color: C.subText,
      lineSpacing: 16,
    });

    const kartClasses = [
      { name: 'Cadet Kart (6.5 HP)', speed: 'Top speed 40 km/h • Ages 10-14 • Ideal for beginners' },
      { name: 'Twin Engine Pro (13 HP)', speed: 'Top speed 75 km/h • Adult drivers • Precision handling' },
      { name: 'Dual Passenger Cruiser', speed: 'Tandem racing • Parent + Child or couples drive together' },
    ];

    kartClasses.forEach((kc, i) => {
      const y = 3.65 + i * 0.9;
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 1.1,
        y: y,
        w: 5.0,
        h: 0.75,
        fill: { color: C.cream },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1,
      });

      slide.addText(kc.name, {
        x: 1.25,
        y: y + 0.1,
        w: 4.7,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.darkGreen,
      });

      slide.addText(kc.speed, {
        x: 1.25,
        y: y + 0.38,
        w: 4.7,
        h: 0.3,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: C.subText,
      });
    });

    // Right card: Race Heat Experience
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.85,
      y: 2.05,
      w: 5.65,
      h: 4.65,
      fill: { color: C.pureWhite },
      line: { color: C.cardBorder, width: 1 },
      rectRadius: 0.15,
    });

    slide.addText('🏁 Real-Time Heat Management', {
      x: 7.15,
      y: 2.3,
      w: 5.0,
      h: 0.4,
      fontSize: 15,
      fontFace: 'Georgia',
      bold: true,
      color: C.charcoal,
    });

    const features = [
      {
        title: 'Max 8 Karts Per Heat',
        desc: 'Guarantees track safety and zero congestion. Racers get clean laps to set personal best lap times.'
      },
      {
        title: 'Mandatory Safety Briefing',
        desc: '10-minute digital and pit-crew briefing covers flag protocols, brake zones, and safety harness verification.'
      },
      {
        title: 'Live Transponder Timing',
        desc: 'Lap times are recorded down to the millisecond. Podium winners receive Court Coin bonus multipliers.'
      },
      {
        title: 'Safety Gear Included',
        desc: 'DOT-certified helmets, neck protectors, and sanitised balaclavas provided with every booking confirmation.'
      }
    ];

    features.forEach((f, idx) => {
      const y = 2.85 + idx * 0.88;
      slide.addText(`•  ${f.title}:`, {
        x: 7.15,
        y: y,
        w: 5.0,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.charcoal,
      });

      slide.addText(f.desc, {
        x: 7.45,
        y: y + 0.28,
        w: 4.7,
        h: 0.55,
        fontSize: 10,
        fontFace: 'Arial',
        color: C.subText,
        lineSpacing: 14,
      });
    });

    addFooter(slide, 5);
  }

  // ==========================================
  // SLIDE 6: CourtSide Pre-Order Food Court
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Post-Match Nutrition & Refreshments', 'CourtSide Cafe: Seamless Pre-Ordered Food');

    slide.addText('Never wait in line with tired legs. QuickCourt synchronizes your food prep with your match buzzer:', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: C.subText,
    });

    const foodPillars = [
      {
        icon: '⏱️',
        title: 'Timed to Match Finish',
        desc: 'Food is prepared 10 minutes before your court session ends. Your smoothies are ice-cold and snacks piping hot when you walk off court.',
        example: 'Example: 7:00 PM game ends → 7:55 PM smoothies blended and labeled at the pickup counter.'
      },
      {
        icon: '🥗',
        title: 'Athlete-Focused Menu',
        desc: 'Carefully curated nutrition designed for post-match recovery: cold-pressed juices, tender coconut water, whey smoothies, and energy bowls.',
        example: 'Popular: Chilled Tender Coconut Water (₹60), 25g Whey Banana Shake (₹120), Energy Bar (₹50).'
      },
      {
        icon: '📱',
        title: '1-Tap Digital Pickup',
        desc: 'No cash, paper receipts, or counter confusion. Show your booking confirmation badge or tell the barista your court number to collect.',
        example: 'Zero payment delay: Food is billed on your unified match invoice or paid via Court Coins.'
      }
    ];

    foodPillars.forEach((fp, idx) => {
      const x = 0.8 + idx * 3.95;
      const y = 2.05;

      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x,
        y: y,
        w: 3.8,
        h: 4.65,
        fill: { color: C.pureWhite },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.15,
      });

      // Icon & Header
      slide.addShape(pres.shapes.OVAL, {
        x: x + 0.3,
        y: y + 0.35,
        w: 0.8,
        h: 0.8,
        fill: { color: C.badgeBg },
        line: { color: C.lime, width: 1 },
      });
      slide.addText(fp.icon, {
        x: x + 0.3,
        y: y + 0.35,
        w: 0.8,
        h: 0.8,
        fontSize: 20,
        align: 'center',
        valign: 'middle'
      });

      slide.addText(fp.title, {
        x: x + 0.3,
        y: y + 1.35,
        w: 3.2,
        h: 0.6,
        fontSize: 15,
        fontFace: 'Georgia',
        bold: true,
        color: C.charcoal,
      });

      slide.addText(fp.desc, {
        x: x + 0.3,
        y: y + 2.05,
        w: 3.2,
        h: 1.1,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.subText,
        lineSpacing: 16,
      });

      // Example Box
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.25,
        y: y + 3.3,
        w: 3.3,
        h: 1.1,
        fill: { color: C.cream },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.1,
      });

      slide.addText(fp.example, {
        x: x + 0.35,
        y: y + 3.38,
        w: 3.1,
        h: 0.95,
        fontSize: 9.5,
        fontFace: 'Arial',
        italic: true,
        color: C.darkGreen,
        lineSpacing: 14,
      });
    });

    addFooter(slide, 6);
  }

  // ==========================================
  // SLIDE 7: Gamified Rewards & Court Coins
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Player Loyalty Program', 'Court Coins & Gamification: Play More, Pay Less');

    slide.addText('Unlike traditional platforms with complicated reward points, QuickCourt keeps rewards crystal clear: 1 Coin = ₹1 Rupee.', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: C.subText,
    });

    // Left card: How coins work
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 2.05,
      w: 5.65,
      h: 4.65,
      fill: { color: C.pureWhite },
      line: { color: C.cardBorder, width: 1 },
      rectRadius: 0.15,
    });

    slide.addText('🪙 The Simple Math: 1 Coin = ₹1', {
      x: 1.1,
      y: 2.3,
      w: 5.0,
      h: 0.4,
      fontSize: 15,
      fontFace: 'Georgia',
      bold: true,
      color: C.charcoal,
    });

    const coinRules = [
      {
        rule: 'Earn 10% on Every Game',
        detail: 'Book a ₹600 badminton court → Earn 60 Court Coins in your digital wallet immediately after completion.'
      },
      {
        rule: '100% Usable at Checkout',
        detail: 'No minimum balance required. Have 40 coins? Get ₹40 off instantly with one click of a slider.'
      },
      {
        rule: 'Digital Scratch Cards',
        detail: 'Every finished weekend match unlocks a digital scratch card with surprise bonus coins (10 to 100 coins).'
      },
      {
        rule: 'Transparent Wallet Ledger',
        detail: 'Every coin earned and spent is itemized in your profile wallet so players always trust their balance.'
      }
    ];

    coinRules.forEach((cr, i) => {
      const y = 2.85 + i * 0.88;
      slide.addText(`•  ${cr.rule}:`, {
        x: 1.1,
        y: y,
        w: 5.0,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: C.darkGreen,
      });
      slide.addText(cr.detail, {
        x: 1.35,
        y: y + 0.28,
        w: 4.75,
        h: 0.55,
        fontSize: 10,
        fontFace: 'Arial',
        color: C.subText,
        lineSpacing: 14,
      });
    });

    // Right card: Real-world savings scenario
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.85,
      y: 2.05,
      w: 5.65,
      h: 4.65,
      fill: { color: 'FAFDF4' },
      line: { color: C.lime, width: 1.5 },
      rectRadius: 0.15,
    });

    slide.addText('🎉 Real-World Example: Monthly Squad Savings', {
      x: 7.15,
      y: 2.3,
      w: 5.0,
      h: 0.4,
      fontSize: 15,
      fontFace: 'Georgia',
      bold: true,
      color: C.darkGreen,
    });

    slide.addText('A squad of 4 friends plays football or badminton twice a week:', {
      x: 7.15,
      y: 2.75,
      w: 5.0,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      color: C.subText,
    });

    const savingsRows = [
      { label: 'Weekly Matches (2 hours)', amount: '₹1,200 spent' },
      { label: 'Weekly Coins Earned (10%)', amount: '+120 coins (₹120)' },
      { label: 'Monthly Base Rewards', amount: '+480 coins (₹480)' },
      { label: 'Monthly Scratch Card Bonuses', amount: '+120 coins (₹120)' },
      { label: 'Total Free Play Earned', amount: '₹600 Free Credit!' },
    ];

    savingsRows.forEach((sr, idx) => {
      const y = 3.25 + idx * 0.65;
      const isTotal = idx === 4;

      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 7.15,
        y: y,
        w: 5.0,
        h: 0.55,
        fill: { color: isTotal ? C.darkGreen : C.pureWhite },
        line: { color: isTotal ? C.darkGreen : C.cardBorder, width: 1 },
        rectRadius: 0.08,
      });

      slide.addText(sr.label, {
        x: 7.3,
        y: y + 0.12,
        w: 3.0,
        h: 0.3,
        fontSize: 10.5,
        fontFace: 'Arial',
        bold: isTotal,
        color: isTotal ? C.lime : C.charcoal,
      });

      slide.addText(sr.amount, {
        x: 10.3,
        y: y + 0.12,
        w: 1.7,
        h: 0.3,
        fontSize: 10.5,
        fontFace: 'Arial',
        bold: true,
        align: 'right',
        color: isTotal ? C.pureWhite : '2E7D32',
      });
    });

    addFooter(slide, 7);
  }

  // ==========================================
  // SLIDE 8: Venue Owner Dashboard
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Empowering Venue Businesses', 'Venue Owner Portal: Ramesh\'s Turf Made Easy');

    slide.addText('Meet Ramesh — he runs "Apex Turf Arena". Before QuickCourt, he struggled with messy paper registers and double-booking disputes.', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: C.subText,
    });

    const ownerTools = [
      {
        icon: '🛑',
        title: '1-Click Slot Blocking',
        desc: 'Heavy rain or net repairs? Ramesh can block any court for specific hours with one tap. Blocked slots appear instantly as unavailable online.',
        benefit: 'Prevents customer disappointment'
      },
      {
        icon: '📊',
        title: 'Live Occupancy & Income',
        desc: 'Visual breakdown of today\'s bookings, confirmed slots, walk-in reservations, and net daily revenue without manual math.',
        benefit: 'Clear financial visibility'
      },
      {
        icon: '🏷️',
        title: 'Custom Peak Pricing',
        desc: 'Set different rates for morning slots vs peak weekend 7 PM lights. QuickCourt automatically calculates correct rates at checkout.',
        benefit: 'Maximizes arena profitability'
      },
      {
        icon: '⚡',
        title: 'Instant Walk-in Entry',
        desc: 'When players walk in from the street, Ramesh can log their cash booking in 5 seconds, immediately locking the slot online.',
        benefit: 'Unified online & offline ledger'
      }
    ];

    ownerTools.forEach((ot, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.95;
      const y = 2.05 + row * 2.35;

      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x,
        y: y,
        w: 5.65,
        h: 2.15,
        fill: { color: C.pureWhite },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.15,
      });

      // Icon Box
      slide.addShape(pres.shapes.OVAL, {
        x: x + 0.3,
        y: y + 0.25,
        w: 0.65,
        h: 0.65,
        fill: { color: C.badgeBg },
        line: { color: C.lime, width: 1 },
      });
      slide.addText(ot.icon, {
        x: x + 0.3,
        y: y + 0.25,
        w: 0.65,
        h: 0.65,
        fontSize: 16,
        align: 'center',
        valign: 'middle'
      });

      // Title
      slide.addText(ot.title, {
        x: x + 1.1,
        y: y + 0.25,
        w: 4.2,
        h: 0.4,
        fontSize: 14,
        fontFace: 'Georgia',
        bold: true,
        color: C.charcoal,
      });

      // Desc
      slide.addText(ot.desc, {
        x: x + 0.3,
        y: y + 0.8,
        w: 5.0,
        h: 0.8,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: C.subText,
        lineSpacing: 16,
      });

      // Benefit
      slide.addText(`Business Benefit: ${ot.benefit}`, {
        x: x + 0.3,
        y: y + 1.65,
        w: 5.0,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: C.darkGreen,
      });
    });

    addFooter(slide, 8);
  }

  // ==========================================
  // SLIDE 9: Reliability, Speed & Testing
  // ==========================================
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Tested & Production Ready', 'Rock-Solid Reliability: Built for Performance');

    slide.addText('We rigorously verified QuickCourt so that every booking, login, and payment calculation executes reliably every time:', {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: C.subText,
    });

    const metrics = [
      {
        number: '23 / 23',
        label: 'Automated Unit Tests',
        desc: 'Every price calculation, promo code rule, and security validation was tested and passed 100% with automated test suites.',
        tag: '100% Pass Rate'
      },
      {
        number: '19 / 19',
        label: 'Browser E2E Tests',
        desc: 'Simulated real user actions across Chrome and mobile screens: opening menus, searching venues, picking slots, and booking matches.',
        tag: 'Full Journey Verified'
      },
      {
        number: '49 Routes',
        label: 'Production Web Pages',
        desc: 'All 49 static and dynamic routes compiled cleanly with 0 errors, ready to support hundreds of concurrent players.',
        tag: 'Production Compiled'
      },
      {
        number: '< 1 Sec',
        label: 'Fast Responsive Loading',
        desc: 'Optimized images and lightweight modern code ensure smooth scrolling and instant booking even on slow 4G mobile connections.',
        tag: 'Mobile Optimized'
      }
    ];

    metrics.forEach((m, idx) => {
      const x = 0.8 + idx * 2.95;
      const y = 2.1;

      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x,
        y: y,
        w: 2.8,
        h: 4.6,
        fill: { color: C.pureWhite },
        line: { color: C.cardBorder, width: 1 },
        rectRadius: 0.15,
      });

      // Number badge
      slide.addText(m.number, {
        x: x + 0.2,
        y: y + 0.4,
        w: 2.4,
        h: 0.8,
        fontSize: 28,
        fontFace: 'Georgia',
        bold: true,
        color: C.darkGreen,
        align: 'center',
      });

      // Label
      slide.addText(m.label, {
        x: x + 0.2,
        y: y + 1.25,
        w: 2.4,
        h: 0.45,
        fontSize: 12,
        fontFace: 'Arial',
        bold: true,
        color: C.charcoal,
        align: 'center',
      });

      // Status pill
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.4,
        y: y + 1.8,
        w: 2.0,
        h: 0.35,
        fill: { color: C.badgeBg },
        line: { color: C.lime, width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(`✓ ${m.tag}`, {
        x: x + 0.4,
        y: y + 1.8,
        w: 2.0,
        h: 0.35,
        fontSize: 9,
        fontFace: 'Arial',
        bold: true,
        color: C.darkGreen,
        align: 'center',
        valign: 'middle'
      });

      // Desc
      slide.addText(m.desc, {
        x: x + 0.3,
        y: y + 2.35,
        w: 2.2,
        h: 1.8,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: C.subText,
        lineSpacing: 16,
      });
    });

    addFooter(slide, 9);
  }

  // ==========================================
  // SLIDE 10: Conclusion & Future Vision
  // ==========================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.darkGreen };

    // Decorative top badge
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: 0.8,
      w: 2.5,
      h: 0.4,
      fill: { color: C.lime },
      line: { color: C.lime },
      rectRadius: 0.15,
    });
    slide.addText('CONCLUSION & FUTURE', {
      x: 1.0,
      y: 0.8,
      w: 2.5,
      h: 0.4,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: C.darkGreen,
      align: 'center',
      valign: 'middle',
    });

    slide.addText('The Future of Recreational Sports', {
      x: 1.0,
      y: 1.4,
      w: 11.0,
      h: 0.8,
      fontSize: 32,
      fontFace: 'Georgia',
      bold: true,
      color: C.lime,
    });

    slide.addText('QuickCourt transforms fragmented sports turf booking into a unified, delightful consumer experience. Here is what comes next:', {
      x: 1.0,
      y: 2.2,
      w: 10.5,
      h: 0.5,
      fontSize: 13,
      fontFace: 'Arial',
      color: C.cream,
    });

    const roadmap = [
      {
        icon: '🏆',
        title: 'Community Tournaments',
        desc: 'Organize weekend badminton & box-cricket leagues with live bracket generation, scoring, and prizes.'
      },
      {
        icon: '🤝',
        title: 'Find-a-Player Matchmaking',
        desc: 'Short of a 4th player for doubles badminton? Post an open spot and match with local players of similar skill.'
      },
      {
        icon: '💡',
        title: 'Smart IoT Court Lights',
        desc: 'Courts automatically illuminate when your QR code is scanned and turn off when your 60-minute session concludes.'
      },
      {
        icon: '📱',
        title: 'Split-Pay Among Friends',
        desc: 'Split the ₹600 fee 4 ways automatically so each friend pays their ₹150 portion directly within the app.'
      }
    ];

    roadmap.forEach((rm, idx) => {
      const x = 1.0 + idx * 2.85;
      const y = 3.0;

      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x,
        y: y,
        w: 2.65,
        h: 3.4,
        fill: { color: '204D37' },
        line: { color: '306349', width: 1 },
        rectRadius: 0.15,
      });

      slide.addText(rm.icon, {
        x: x + 0.25,
        y: y + 0.3,
        w: 0.8,
        h: 0.6,
        fontSize: 24,
      });

      slide.addText(rm.title, {
        x: x + 0.25,
        y: y + 1.0,
        w: 2.15,
        h: 0.6,
        fontSize: 13,
        fontFace: 'Georgia',
        bold: true,
        color: C.lime,
      });

      slide.addText(rm.desc, {
        x: x + 0.25,
        y: y + 1.65,
        w: 2.15,
        h: 1.4,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: C.cream,
        lineSpacing: 15,
      });
    });

    // Thank you text at bottom
    slide.addText('Thank You  •  Ready for Live Demo & Faculty Q&A', {
      x: 1.0,
      y: 6.7,
      w: 11.33,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Arial',
      italic: true,
      color: 'B8CDBA',
      align: 'center',
    });
  }

  // Save the presentation
  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outPath = path.join(outputDir, 'QuickCourt_Project_Presentation.pptx');
  await pres.writeFile({ fileName: outPath });
  console.log('✅ Generated clean, jargon-free PPTX at:', outPath);

  // Copy to public folder
  const publicPath = path.join(__dirname, '..', 'public', 'QuickCourt_Project_Presentation.pptx');
  fs.copyFileSync(outPath, publicPath);
  console.log('✅ Copied PPTX to public folder at:', publicPath);
}

createQuickCourtPresentation().catch((err) => {
  console.error('❌ Failed to build presentation:', err);
  process.exit(1);
});
