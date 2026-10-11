# Design guide: GDG on Campus hub

A plain-English tour of how the site looks, how the homepage animations work, and where to change things.
Written for people who are new to code. No 3D knowledge needed.

---

## 1. The big idea

- **Light, clean, Google colors.** White pages, big tight headlines, small colored accents.
- **One 3D scene per section.** Each scene tells you what the section is about (office, badge, calendar...).
- **Everything is mock data.** No backend. Data lives in the browser, so it works anywhere.
- **Works on desktop and phones.** Phones get a lighter 3D setup. A 2D fallback exists for everything.

---

## 2. Look and feel

### Colors

| Color | Hex | Used for |
| --- | --- | --- |
| Blue | `#4285F4` | Tech team, main buttons, links |
| Red | `#EA4335` | Media team, talks |
| Yellow | `#FBBC04` | Design team, highlights |
| Green | `#34A853` | PR team, success states |
| Soft tints | `#E8F0FE` `#FCE8E6` `#FEF7E0` `#E6F4EA` | Card and panel backgrounds |
| Ink / grey | `#202124` / `#5F6368` | Text |

- Each section has its own accent color. Look at the small dot above each heading.
- Team colors are the same everywhere: chips, 3D zones, charts, network dots.

### Type

- **Headings:** Inter Tight, very tight spacing. Line 2 is light grey for contrast.
- **Body:** Inter.
- **Small labels and numbers:** JetBrains Mono, uppercase, wide spacing.

### Shapes and spacing

- Big rounded cards (`2rem`), thin grey borders, lots of white space.
- A yellow "marker" highlight sits behind one key word in a headline.
- No dark mode, no glow, no neon, no gradient text. Colors stay flat.

### The 3D style ("clay")

- Soft rounded shapes, matte colors, soft shadows.
- White and pastel bases, Google colors only on small accents.
- Built from simple shapes in code. No downloaded 3D models, so pages stay light.

---

## 3. Project map

| Folder | What lives there |
| --- | --- |
| `src/config/brand.ts` | Club name, colors, team list |
| `src/data/` | Fake members, events, applicants, milestones, gallery art |
| `src/store/` | The app's memory (members, RSVPs, settings) saved in the browser |
| `src/sections/` | The homepage blocks, in order |
| `src/pages/` | Members, Dashboard, Events, Applicants |
| `src/three/` | All 3D scenes |
| `src/components/` | Shared pieces: navbar, footer, buttons, drawers |
| `src/lib/` | Small helpers (smooth scroll, 3D quality check, calendar export) |

---

## 4. How the 3D renders (the simple version)

```
Page loads  ->  text and layout appear first
            ->  3D code downloads in the background
            ->  scenes fade in where each frame sits
```

- **Desktop:** one big invisible 3D canvas sits over the page. Each scene is drawn into its own box on the page.
- **Phones:** each scene gets its own small canvas inside its box. It only exists while that box is near the screen.
  - Why: a big overlay canvas stutters against phone scrolling. Small canvases scroll with the page.
- **Each scene has its own camera and lights.** Scenes don't know about each other.
- **Three quality levels** are picked automatically:

| Level | When | What you get |
| --- | --- | --- |
| High | Desktop with a decent computer | Shared canvas, real soft shadows |
| Low | Phones, tablets, small screens, weak devices | Per-scene canvases, no heavy shadows |
| Off | No WebGL, or "reduce motion" is on | A flat 2D fallback card |

- The **"3D on/off"** button in the navbar overrides this.
- 3D code is **lazy-loaded**, so the first paint stays fast.

### Words you will see in the code

- **Canvas:** the drawing surface for 3D.
- **Mesh:** one 3D object (shape + material).
- **Material:** how a shape looks (color, shininess).
- **Camera:** the viewpoint. Orthographic = no perspective (isometric). Perspective = normal.
- **useFrame:** a function that runs every frame. This is where animation happens.
- **lerp:** "move a little closer to the target each frame". Gives smooth motion.
- **Texture:** an image wrapped on a shape. Some are drawn with the 2D canvas API.
- **Instanced mesh:** many copies of one shape drawn in one go (fast).

---

## 5. Homepage animations, section by section

Every section also fades up when scrolled into view (`Reveal` in `primitives.tsx`).

### Navbar
- Starts see-through. After 8px of scroll it gets a white blurred background and a line.
- On small screens it becomes a menu drawer.
- The "3D on/off" pill switches all scenes to the 2D fallback.

### 1. Hero: the clubhouse (`Clubhouse.tsx`)
- **Camera:** orthographic, placed diagonally. This gives the isometric "diorama" look.
- **Build:** floor, two back walls, four colored rugs (Tech, Media, Design, PR), desks, plants, props.
- **Four-color strip** runs along the top of the walls.
- **People** idle: they bob, tilt their heads, and "type" with their arms.
- **Floating GDG logo** bobs up and down and turns slightly toward your cursor.
- **Hover a zone:** it lifts 0.12 units and its edge glows. The legend chip below highlights too.
- **Click or tap a zone:** goes to that team's members.
- **Stats row:** numbers count up when they appear.

### 2. Recruitment: the ID badge (`BadgeScene.tsx`)
- **Live card:** the card face is drawn with the normal 2D canvas, then used as an image on the 3D card.
- **It redraws** every time you change the name, team or branch. The header color follows the team.
- **QR code and barcode** are fake. They are made from a number built out of your name.
- **Swinging:** a simple spring physics model.
  - Moving the mouse pushes the badge sideways, like a real lanyard.
  - It then settles back and wobbles a little.
- **Flip:** click or tap and it turns 180 degrees to show the back.
- **Shiny plastic and metal** come from a few invisible light panels (no image files).
- **Page behind** changes color with the team you pick.

### 3. Meets: the 3D calendar (`CalendarScene.tsx`)
- **Date grid:** drawn as one image (weekdays, dates, today highlighted).
- **Towers:** each event becomes a tower on its date.
  - Taller tower = more people going.
  - Color = event type (blue workshop, red talk, yellow hackathon, green social).
  - Past events fade to grey.
- **Grow-in:** towers rise when the month loads.
- **Hover** lifts a tower. **Click** selects it, and the card on the right updates.
- **RSVP** puts a green ball on top of the tower.
- **Month arrows** redraw the grid and rebuild the towers.
- **Add to calendar** downloads a real `.ics` file.

### 4. Gallery: the bending carousel (`GalleryScene.tsx`)
- **Six cards** sit in a row. Their position depends on how far each is from the "current" card.
  - Closer to center = bigger, brighter, facing you.
  - Farther = smaller, dimmer, turned away.
- **Drag or swipe** changes the target position. The row glides to it.
- **The bend:** card speed feeds a small shader that curves the card while it moves. It flattens when it stops.
- **Rounded corners** are cut in the shader, so no extra shapes.
- **Artwork** is drawn in code as placeholders. Add real photos in `src/data/gallery.ts`.
- **Click the middle card** to open a full-size viewer. Arrow keys and Esc work.

### 5. Milestones: the road (`MilestoneTrack.tsx`)
- **Scroll drives everything.** The page measures how far you've scrolled through the section (0 to 100%).
- **The road** is a smooth curve. The camera slides along it.
- **The club bus** sits at the same point on the curve and turns to face the road direction.
- **Four stops** along the road:
  - 2023 clubhouse and flag
  - 2024 spinning trophy
  - 2025 stage with a bouncing crowd
  - 2026 tower of 60 colored blocks
- **Cards on the right** highlight as you reach each year. The 3D panel stays pinned (sticky).

### 6. Community: the member network (`MemberNetwork.tsx`)
- **60 dots** = 60 members. Dot color = team.
- **Placement:** each team has a cluster center. Each member gets a repeatable random spot near it.
- **Lines** connect each member to two teammates, plus a few same-branch links across teams.
- **Slow auto-spin.** Tilts a little with the pointer.
- **Hover:** the dot grows and a name card appears below.
- **Team chips:** other teams fade to grey, the chosen team stays bright.
- **Click or tap** opens that person's profile.

### 7. Call to action: the rocket (`RocketScene.tsx`)
- **Idle:** the rocket floats gently. A flame flickers.
- **Launch (click the rocket or the Launch button):**
  1. It shakes for about 0.7 seconds.
  2. It speeds upward, faster and faster.
  3. The flame stretches and 48 colored smoke puffs burst out.
  4. After about 3 seconds it resets.
- A message below confirms applications are open.

---

## 6. Pointer and touch feel

| Device | What happens |
| --- | --- |
| Mouse | Cards lift slightly and show a soft colored spotlight under the cursor. Main buttons lean toward the cursor, then spring back. |
| Touch | A quick press-in on tap. No hover effects stick after tapping. No extra overlays. |
| Both | The 3D scenes react to pointer movement (parallax, swinging, hover). |

- There is **no custom cursor ring and no tap burst**. Native cursor and native touch feedback stay.

---

## 7. Other pages in one line each

| Page | What it does |
| --- | --- |
| `/members` | Search, filter, sort. Grid, table or 3D network. Profile drawer. Add, edit, remove. CSV import and export. Birthdays. |
| `/dashboard` | KPI cards, a 3D team chart, plus 2D charts for attendance, branch, year and points. Leaderboard and activity. |
| `/events` | Create events, RSVP, calendar export, check people in. |
| `/applicants` | Drag cards between stages. Add selected people to the roster. |

- The **Admin / Member** switch (Members page) hides management buttons for members.
- **Reset demo data** (footer) restores the starting data.

---

## 8. Performance and access

- **Fast first load:** 3D and chart code load only when needed.
- **Phones:** small canvases, only while near the screen, and a lower pixel density.
- **Soft ground shadows** are drawn for about a second, not every frame.
- **Reduced motion:** respected. Scenes switch to the 2D fallback.
- **Keyboard:** all buttons work with the keyboard. There is a "Skip to content" link.
- **Screen readers:** every 3D box has a text label describing it.

---

## 9. Quick tweaks for beginners

| I want to... | Edit this |
| --- | --- |
| Change club name or colors | `src/config/brand.ts` |
| Change members, events, milestones | `src/data/seed.ts` |
| Use real gallery photos | `src/data/gallery.ts` (set `src`) |
| Make the badge swing more or less | Spring numbers in `BadgeScene.tsx` (`-18` and `-1.6`) |
| Make people move faster or slower | `speed` on `<Person />` in `Clubhouse.tsx` |
| Change tower heights | `height` line in `CalendarScene.tsx` |
| Change how far the zones lift | `0.12` in the `Zone` component, `Clubhouse.tsx` |
| Turn 3D off for everyone | Set `motion: false` in `src/store/useStore.ts` |

Run it: `npm install`, then `npm run dev`. Build it: `npm run build`.
