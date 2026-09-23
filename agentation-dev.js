/* ==========================================================================
   Agentation – visuell återkoppling under utveckling

   Klicka på ett element i sidan, skriv en kommentar, och kodagenten kan läsa
   exakt vad du pekade på. Verktygsfältet sitter nere till höger.

   Varför filen ser ut så här: sajten är ren HTML utan byggsteg, medan
   agentation är en React-komponent. Utan bundlare kan webbläsaren inte läsa
   paketet i node_modules – React 18 levereras som CommonJS, vilket ingen
   webbläsare kan importera. Därför hämtas både React och komponenten som
   färdiga ES-moduler från esm.sh i stället.

   Hela filen är avstängd utanför localhost. Sökvägen ?deps= gör att
   komponenten och sidan delar exakt samma React-instans, annars monterar den
   inte.

   Stäng av verktyget helt: ta bort <script>-raden i index.html.
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
        import(`https://esm.sh/react@${REACT}`),
        import(`https://esm.sh/react-dom@${REACT}/client`),
        import(
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
