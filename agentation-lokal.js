/* ==========================================================================
   AGENTATION – visuell återkoppling till AI-agenten

   Agentation är byggt som en React-komponent och distribueras bara via npm.
   Den här sidan har varken React eller byggsteg, så komponenten hämtas i
   stället som ES-modul från esm.sh och monteras i en egen behållare.

   Skriptet kör BARA på localhost. På den skarpa sidan avbryter det direkt
   och laddar ingenting.

   Så här används det: klicka på verktygsfältet nere till höger, klicka på
   det du vill ändra, skriv din kommentar och kopiera. Klistra sedan in i
   chatten – utdatan innehåller selektorer och positioner som gör att jag
   hittar exakt rätt ställe i koden.

   Tas bort innan lansering: radera den här filen och script-taggen i
   index.html.
   ========================================================================== */

const LOKALT = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

if (LOKALT) {
  const REACT = 'https://esm.sh/react@18.3.1';
  const DOM   = 'https://esm.sh/react-dom@18.3.1/client';
  const AG    = 'https://esm.sh/agentation@3.0.2?deps=react@18.3.1,react-dom@18.3.1';

  try {
    const [react, reactDom, agentation] = await Promise.all([
      import(REACT), import(DOM), import(AG)
    ]);

    const behallare = document.createElement('div');
    behallare.id = 'agentation-rot';
    document.body.appendChild(behallare);

    reactDom.createRoot(behallare).render(
      react.createElement(agentation.Agentation)
    );
  } catch (fel) {
    console.warn('Agentation kunde inte laddas:', fel);
  }
}
