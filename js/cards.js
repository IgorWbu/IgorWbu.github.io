/* ============================================================
   THE CARDS: edit the text, the dates and the look of each note here.
   - unlock:  the day and hour the card opens, on HER phone's clock ("YYYY-MM-DD" = 00:00)
   - note:    which paper: yellow | pink | blue | orange
   - tilt:    how much the note is turned, in degrees
   - title/text: font sizes, as % of the note's width
   - body:    one string per paragraph. Wrap a phrase in *stars* to set it in italics.
   To add the 21 Nov card: copy a block, give it a new date, and it joins the stack.
   ============================================================ */
window.INTRO = {
  first: "Here are your cards.",   // the first time she opens the page (only one card is open)
  later: "Today’s card.",       // the following days
  last:  "The last card."           // when every card is open
};

window.CARDS = [
  {
    unlock: "2026-11-14", date: "14 November", note: "yellow", tilt: -1.3, title: "Happy birthday, baby.", sizes: { title: 10.4, text: 4.8 },
    body: [
      "Four cards, one a day. Each one is about something I love in you.",
      "We start with your laugh.",
      "On 13 October I told you I’d dreamt I burned the tres leches again. You sent back 24 h’s and *“the funniest thing I’ve heard today.”*",
      "I love being the reason for that."
    ]
  },
  {
    unlock: "2026-11-15", date: "15 November", note: "pink", tilt: 1.2, title: "Your heart", sizes: { title: 12, text: 5.2 },
    body: [
      "I asked you once which other life you’d pick. You said you’re grateful for the one you have, and that the more you grow up, the more God makes the road beautiful for you.",
      "Things get heavy for you and you still look for what’s good in them. I love that.",
      "It’s in the small things too. Your mum’s sardine kefta: *“I love it, can’t wait to eat it.”*"
    ]
  },
  {
    unlock: "2026-11-16", date: "16 November", note: "blue", tilt: -.8, title: "Your strength", sizes: { title: 11, text: 4.8 },
    body: [
      "The night you landed, your first message from the hotel said *“It’s not good hehe but mhm let’s just be positive.”* It was very dirty, you were exhausted, and you were already looking for the way through.",
      "You told me you don’t like depending on someone else for your plans. So you run them yourself, you carry a lot, and you still send me pictures from a trip that’s wearing you out.",
      "I’m proud of you."
    ]
  },
  {
    unlock: "2026-11-17", date: "17 November", note: "orange", tilt: 1.0, title: "Welcome back.", sizes: { title: 11.5, text: 4.7 },
    body: [
      "Last card, and the only one about us.",
      "The first night we talked, you told me you’d once written in your journal *“oh to be loved by a writer.”* I said *“you soon will.”*",
      "In April you told me you were rereading our emails and that they were sweet. Keep these with them.",
      "In May you said cooking for each other could be our love language. You pick the dish, I’ll bring the burnt edges.",
      "I’ll see you today or tomorrow. I have a few things for you."
    ]
  }
  /* , { unlock: "2026-11-21", date: "21 November", note: "yellow", tilt: .9, title: "...", sizes: { title: 11, text: 5 }, body: ["..."] } */
];
