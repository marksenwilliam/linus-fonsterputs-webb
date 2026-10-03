/* ==========================================================================
   Agentation – visuell återkoppling under utveckling

   Klicka på ett element i sidan, skriv en kommentar, och kodagenten kan läsa
   exakt vad du pekade på. Verktygsfältet sitter nere till höger.

   Filen läggs in av dev-servern och av ingenting annat: integrationen
   "agentation-dev" i astro.config.mjs injicerar den bara vid `astro dev`, så
   den följer aldrig med i bygget.

   Varför filen ser ut så här: agentation är en React-komponent, och React 18
   levereras som CommonJS. Att använda paketet i node_modules rakt av skulle
   kräva react, react-dom och @astrojs/react i projektet. Därför hämtas både
   React och komponenten som färdiga ES-moduler från esm.sh i stället.
   Kommentaren "@vite-ignore" i varje import() hindrar Vite från att försöka
   analysera adresserna.

   Hela filen är avstängd utanför localhost. Sökvägen ?deps= gör att
   komponenten och sidan delar exakt samma React-instans, annars monterar den
   inte.

   Stäng av verktyget helt: ta bort integrationen "agentation-dev" i
   astro.config.mjs.
   ========================================================================== */

(() => {
  "use strict";

  const LOKALA_VARDAR = ["localhost", "127.0.0.1", "[::1]", ""];
  if (!LOKALA_VARDAR.includes(location.hostname)) return;

  const REACT = "18.3.1";
  const AGENTATION = "3.1.2";

  /* Samma port som MCP-servern i .mcp.json lyssnar på. Anteckningarna sparas
     lokalt även om servern är nere, och skickas upp när den svarar igen. */
  const ANDPUNKT = "http://localhost:4747";

  const main = async () => {
    try {
      const [reactModul, klientModul, agentationModul] = await Promise.all([
        import(/* @vite-ignore */ `https://esm.sh/react@${REACT}`),
        import(/* @vite-ignore */ `https://esm.sh/react-dom@${REACT}/client`),
        import(
          /* @vite-ignore */
          `https://esm.sh/agentation@${AGENTATION}?deps=react@${REACT},react-dom@${REACT}`
        ),
      ]);

      const React = reactModul.default ?? reactModul;
      const { createRoot } = klientModul;
      const { Agentation } = agentationModul;

      if (typeof Agentation !== "function") {
        throw new Error("paketet exporterade ingen Agentation-komponent");
      }

      const rot = document.createElement("div");
      rot.id = "agentation-rot";
      document.body.appendChild(rot);

      createRoot(rot).render(
        React.createElement(Agentation, { endpoint: ANDPUNKT })
      );

      console.info(
        `[agentation] ${AGENTATION} laddad – verktygsfältet ligger nere till höger, skickar till ${ANDPUNKT}`
      );
    } catch (fel) {
      console.error("[agentation] kunde inte laddas:", fel);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main, { once: true });
  } else {
    main();
  }
})();
