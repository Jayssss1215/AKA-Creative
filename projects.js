// ----------------------------------------------------------
// AKA Creative — project detail data
// One entry per card id used on index.html. Add new projects
// here and point a card's href at project.html?id=<key>.
// ----------------------------------------------------------
const PROJECTS = {
  "nocturne-ldn": {
    client: "Nocturne LDN",
    project: "Nocturne LDN",
    title: "Warehouse · Resi",
    about: "Nocturne LDN is a late-night warehouse residency built on low light and low frequencies. We were brought in to capture the room the way it actually feels at 2am — dense, physical, unpolished.",
    approach: "Two cameras, no rigs, no set relight. We shot on the floor with the crowd across three sessions, cutting the final piece around the sound system rather than around a script."
  },
  "nocturne-ldn-resi": {
    client: "Nocturne LDN",
    project: "Nocturne LDN — Resi",
    title: "Warehouse · Resi",
    about: "A companion piece to the main Nocturne LDN film, focused on the residents themselves — the DJs, door staff and regulars who make the night what it is.",
    approach: "Portrait-led coverage shot between sets, paired with ambient room tone recorded live rather than added in post."
  },
  "superbloc": {
    client: "SUPERBLOC",
    project: "SUPERBLOC — Brand Launch",
    title: "Brand Launch · 12k",
    about: "SUPERBLOC's launch needed to land in front of 12,000 people in a single afternoon. Our job was to make the brand feel inevitable, not introduced.",
    approach: "We built the shoot around a single hero location and let the crowd's reaction carry the story, cutting live-event footage against controlled studio inserts."
  },
  "halcyon-stage": {
    client: "Halcyon",
    project: "Halcyon Stage — Tour Design",
    title: "Tour Design · 14 cities",
    about: "A 14-city run meant the visual language had to survive completely different venues, crews and lighting rigs without losing its identity.",
    approach: "We designed a modular stage package and documented the first four dates ourselves, handing off a shot list and lighting guide so every remaining city stayed on-brand."
  },
  "solstice-field": {
    client: "Solstice Field",
    project: "Solstice Field — Festival",
    title: "Festival · Lagos",
    about: "Solstice Field is a sunrise-to-sunset festival outside Lagos. The brief was simple: make people who weren't there feel like they missed something.",
    approach: "We ran a two-camera documentary crew across the full day, prioritising natural light and unscripted moments over staged coverage."
  },
  "echo-chamber": {
    client: "Echo Chamber",
    project: "Echo Chamber — Installation",
    title: "Installation · Berlin",
    about: "A sound and light installation built inside a disused Berlin substation. We documented both the build and the three-night public run.",
    approach: "Long static takes let the installation's own pacing dictate the edit, with a handheld pass reserved for opening night only."
  },
  "pulse-festival": {
    client: "Pulse Festival",
    project: "Pulse Festival",
    title: "Lisbon · 80k",
    about: "Pulse Festival pulled 80,000 people to the Lisbon waterfront over a single weekend. We covered it as aftercare content and a recap film in parallel.",
    approach: "A six-person crew split across stages and campgrounds, feeding same-day edits for socials while banking footage for the longer recap."
  },
  "nocturne-ldn-events": {
    client: "Nocturne LDN",
    project: "Nocturne LDN — Live",
    title: "Warehouse · Resi",
    about: "The events-side cut of Nocturne LDN, built for partner and venue reels rather than the brand film.",
    approach: "Re-edited from the same source footage with a faster pace and wider aspect for booking and press use."
  },
  "superbloc-events": {
    client: "SUPERBLOC",
    project: "SUPERBLOC — Launch Day",
    title: "Brand Launch · 12k",
    about: "A straight document of the SUPERBLOC launch day itself, used internally to brief future event partners.",
    approach: "Fixed-position multi-cam coverage of the full run of show, minimally edited to preserve timing for planning reference."
  },
  "halcyon-stage-events": {
    client: "Halcyon",
    project: "Halcyon Stage — Tour Stop",
    title: "Tour Design · 14 cities",
    about: "Coverage of a single Halcyon tour stop, used to show promoters what the touring rig looks like live.",
    approach: "Wide venue shots paired with crowd reaction, framed to sell the stage design as much as the performance."
  },
  "solstice-field-events": {
    client: "Solstice Field",
    project: "Solstice Field — Festival Recap",
    title: "Festival · Lagos",
    about: "The recap edit of Solstice Field, built for the festival's own socials and next-year ticket push.",
    approach: "Tighter, faster cut of the same documentary footage, scored to match the festival's own set rather than a licensed track."
  },
  "echo-chamber-events": {
    client: "Echo Chamber",
    project: "Echo Chamber — Opening Night",
    title: "Installation · Berlin",
    about: "Opening-night coverage of Echo Chamber, focused on the public's first reaction to the installation.",
    approach: "Handheld, low-light coverage shot to feel like a guest moving through the space rather than a crew documenting it."
  },
  "photo-nocturne-ldn": {
    client: "Nocturne LDN",
    project: "Nocturne LDN — Photography",
    title: "Warehouse · Resi",
    about: "The still-photography set from Nocturne LDN, shot to stand on its own for press and print rather than as film stills.",
    approach: "Shot handheld on fast primes in the room's own light, no flash, so the grain and contrast match how the night actually looked."
  },
  "photo-nocturne-ldn-resi": {
    client: "Nocturne LDN",
    project: "Nocturne LDN — Resi Portraits",
    title: "Warehouse · Resi",
    about: "A portrait series of the residency's regular DJs and door staff, shot between sets over several weekends.",
    approach: "Consistent single-light setup carried between locations so the whole series reads as one body of work."
  },
  "photo-superbloc": {
    client: "SUPERBLOC",
    project: "SUPERBLOC — Launch Photography",
    title: "Brand Launch · 12k",
    about: "Stills coverage of the SUPERBLOC launch, shot for press kits and paid social rather than the recap film.",
    approach: "A dedicated photo team worked the crowd and hero stage in parallel with the video crew, prioritising clean single-subject frames."
  },
  "photo-halcyon-stage": {
    client: "Halcyon",
    project: "Halcyon Stage — Tour Photography",
    title: "Tour Design · 14 cities",
    about: "Production stills from the Halcyon tour, used by promoters and press across all 14 stops.",
    approach: "One photographer travelled with the full run, giving every city a matching visual reference despite different venues."
  },
  "photo-solstice-field": {
    client: "Solstice Field",
    project: "Solstice Field — Festival Photography",
    title: "Festival · Lagos",
    about: "A photo essay of Solstice Field shot across the full day, from empty-field setup to sunset crowd.",
    approach: "Natural light only, shot in long unbroken stretches rather than posed set-ups, to match the documentary tone of the film."
  },
  "photo-echo-chamber": {
    client: "Echo Chamber",
    project: "Echo Chamber — Installation Photography",
    title: "Installation · Berlin",
    about: "Architectural and detail photography of the Echo Chamber installation, shot before doors opened to the public.",
    approach: "Tripod-based long exposures captured the light and sound design cleanly, without crowd movement in frame."
  }
};