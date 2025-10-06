export const CHATS = [
  {
    id: "codenight",
    isGroup: true,
    title: "GY - CODENIGHT DİYARBAKIR",
    subtitle: "'Emircan' grup davet bağlantısını kullanarak katıldı",
    time: "18:14",
    participants: [
      "905322106531",
      "905511329225",
      "905338976605",
      "905356869949",
      "905316887526",
      "905535352193",
    ],
    seedMessages: [
      {
        id: "m1",
        text: "'Beran özboyacı' grup davet bağlantısını kullanarak katıldı",
        createdAt: new Date().toISOString(),
        fromMe: false,
        system: true,
      },
      {
        id: "m2",
        text: "'Emircan' grup davet bağlantısını kullanarak katıldı",
        createdAt: new Date(Date.now() + 1000).toISOString(),
        fromMe: false,
        system: true,
      },
    ],
  },
  {
    id: "ali",
    isGroup: false,
    title: "Ali",
    subtitle: "Son görülme az önce",
    time: "18:10",
    participants: ["Ali Işık"],
    seedMessages: [
      {
        id: "a1",
        text: "Selam Ali, BiP benzeri web UI hazır 🎉",
        createdAt: new Date().toISOString(),
        fromMe: true,
      },
    ],
  },
];
