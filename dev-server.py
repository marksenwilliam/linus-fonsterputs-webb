# Lokal utvecklingsserver for Linus Fonsterputs.
#
#   python dev-server.py 8080
#
# Enda uppgiften ar att forbjuda cachning. Pythons inbyggda http.server
# skickar bara Last-Modified och ingen Cache-Control, och da hittar
# webblasaren pa en egen farskhetstid och slutar fraga servern. Resultatet ar
# att en andrad stil.css inte syns forran man laddar om hart, vilket ar latt
# att missta for ett fel i koden.
#
# Verktyget Agentation laddas inte harifran utan av agentation-dev.js, som
# ligger i index.html. Den fungerar darfor med vilken lokal server som helst.

import http.server
import socketserver
import sys
from pathlib import Path


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_header(self, keyword, value):
        # Last-Modified tas bort helt: utan den kan webblasaren inte heller
        # gissa sig till en egen farskhetstid.
        if keyword.lower() == "last-modified":
            return
        super().send_header(keyword, value)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", port), Handler) as server:
        print(f"Serverar {Path.cwd()} pa http://127.0.0.1:{port}/ utan cachning")
        server.serve_forever()
