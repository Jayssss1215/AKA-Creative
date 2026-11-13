// ----------------------------------------------------------
// AKA Creative — project detail data
// One entry per card id used on portfolio. Add new projects
// here and point a card's href at project?id=<key>.
//
// video / thumb  — used when the URL has no ?src= (e.g. the clean
//                  canonical URL project?id=<key> that Google indexes)
// category       — "event" or "commercial" (used for SEO descriptions)
// date           — optional YYYY-MM, used for structured data
// ----------------------------------------------------------
const PROJECTS = {
  "Klangkustenler-Marquee": {
    title: "Klangkustenler Marquee",
    category: "event",
    video: "assets/video/events/Klangkustenler Marquee.mp4",
    thumb: "assets/images/events/thumbnail/klangkustenler_thumbnail.webp"
  },
  "Stamina-Club": {
    title: "Stamina Club",
    category: "event",
    date: "2025-04",
    video: "assets/video/events/Stamina Club.mp4",
    thumb: "assets/images/events/thumbnail/stamina_thumbnail.webp"
  },
  "Johnsummit-Siam-Songkran": {
    title: "Johnsummit Siam Songkran",
    category: "event",
    date: "2025-03",
    video: "assets/video/events/Johnsummit Siam Songkran.mp4",
    thumb: "assets/images/events/thumbnail/johnsummit_thumbnail.webp"
  },
  "Hyper-Rave-Melbourne": {
    title: "Hyper Rave Melbourne",
    category: "event",
    video: "assets/video/events/Hyper Rave Melbourne .mp4",
    thumb: "assets/images/events/thumbnail/hyperrave_thumbnail.webp"
  },
  "Muji-Fes-Thailand": {
    title: "Muji Fes Thailand",
    category: "event",
    video: "assets/video/events/Muji Fes Thailand.mp4",
    thumb: "assets/images/events/thumbnail/mujifest_thumbnail.webp"
  },
  "Together-Festival-Thailand": {
    title: "Together Festival Thailand",
    category: "event",
    video: "assets/video/events/Together Festival Thailand.mp4",
    thumb: "assets/images/events/thumbnail/together_thumbnail.webp"
  },
  "808-Festival": {
    title: "808 Festival",
    category: "event",
    video: "assets/video/events_more/808 Festival 4K.mp4",
    thumb: "assets/images/events/808 CAM 1-3 4.webp"
  },
  "Camelphat": {
    title: "Camelphat",
    category: "event",
    video: "assets/video/events_more/Camelphat 23.01.26 4K.mp4",
    thumb: "assets/images/events/thumbnail/camelphat_thumbnail.webp"
  },
  "Eta-Club": {
    title: "Eta Club",
    category: "event",
    video: "assets/video/events_more/Eta Club.mp4",
    thumb: "assets/images/events/thumbnail/eta_thumbnail.webp"
  },
  "Subwerk1": {
    title: "Subwerk1",
    category: "event",
    video: "assets/video/events_more/Subwerk1.mp4",
    thumb: "assets/images/events/thumbnail/subwerk_thumbnail.webp"
  },
  "85Mm-Brightin-Star": {
    title: "85Mm Brightin Star",
    category: "commercial",
    video: "assets/video/commercials/85Mm Brightin Star.mp4",
    thumb: "assets/images/commercials/85mm_thumbnail.webp"
  },
  "Blazar-X-Oculus": {
    title: "Blazar X Oculus",
    category: "commercial",
    date: "2025-06",
    video: "assets/video/commercials/Blazar X Oculus.mp4",
    thumb: "assets/images/commercials/blazar_thumbnail.webp"
  },
  "Dji-Pocket4p-Kanthamet": {
    title: "Dji Pocket4p Kanthamet",
    category: "commercial",
    date: "2025-09",
    video: "assets/video/commercials/Dji Pocket4p Kanthamet 4K No Text.mp4",
    thumb: "assets/images/commercials/dji_thumbnail.webp"
  },
  "Park-Ranger": {
    title: "Park Ranger",
    category: "commercial",
    date: "2024-11",
    video: "assets/video/commercials/Park Ranger.mp4",
    thumb: "assets/images/commercials/parkranger_thumbnail.webp"
  },
  "Sakk-V2": {
    title: "Sakk V2",
    category: "commercial",
    video: "assets/video/commercials/Sakk V2.mp4",
    thumb: "assets/images/commercials/sakk_thumbnail.webp"
  },
  "Wander-Luggage": {
    title: "Wander Luggage",
    category: "commercial",
    date: "2024-10",
    video: "assets/video/commercials/Wander Luggage 4K.mp4",
    thumb: "assets/images/commercials/wanderluggage_thumbnail.webp"
  },
  "Air3s": {
    title: "Air3s",
    category: "commercial",
    video: "assets/video/commercial_more/Air3s.mp4",
    thumb: "assets/images/commercials/air3s_thumbnail.webp"
  },
  "Kimono-Edit": {
    title: "Kimono Edit",
    category: "commercial",
    video: "assets/video/commercial_more/Kimono Edit.mp4",
    thumb: "assets/images/commercials/kimono_thumbnail.webp"
  },
  "Pantene": {
    title: "Pantene",
    category: "commercial",
    video: "assets/video/commercial_more/Pantene 4K.mp4",
    thumb: "assets/images/commercials/pantene_thumbnail.webp"
  },
  "Running": {
    title: "Running",
    category: "commercial",
    video: "assets/video/commercial_more/Running.mp4",
    thumb: "assets/images/commercials/running_thumbnail.webp"
  },
  "Singapore-Home": {
    title: "Singapore Home",
    category: "commercial",
    video: "assets/video/commercial_more/Singapore Home.mp4",
    thumb: "assets/images/commercials/singapore_thumbnail.webp"
  },
  "Tokyo-In-Anamorphic": {
    title: "Tokyo In Anamorphic",
    category: "commercial",
    video: "assets/video/commercial_more/Tokyo In Anamorphic.mp4",
    thumb: "assets/images/commercials/tokyo_thumbnail.webp"
  },
};
