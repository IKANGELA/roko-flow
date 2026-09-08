"""
Rejestruje czcionkę DejaVu Sans dla wszystkich generowanych PDF-ów i udostępnia gotowe
style akapitów. Współdzielone przez każdy moduł w app/pdf/ — patrz komentarz niżej,
dlaczego to w ogóle jest potrzebne (i dlaczego nie wystarczy domyślna czcionka reportlab).
"""

import os

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Domyślne czcionki reportlab (Helvetica itp.) nie mają polskich znaków (ą, ć, ę, ł, ń, ó,
# ś, ź, ż) — wychodzą jako czarne kwadraty, bez żadnego błędu (widać to dopiero po otwarciu
# PDF-a). Czcionka Vera dołączona do samego reportlab też nie ma (to oryginalny, niepolski
# Bitstream Vera Sans) — dopiero jego rozszerzony fork, DejaVu Sans, ma pełne pokrycie
# Latin Extended-A. Pliki czcionki są zapakowane w repo (app/pdf/fonts/), licencja DejaVu
# pozwala na redystrybucję — patrz fonts/LICENSE.txt.
_KATALOG_CZCIONEK = os.path.join(os.path.dirname(__file__), "fonts")
pdfmetrics.registerFont(TTFont("DejaVu", os.path.join(_KATALOG_CZCIONEK, "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", os.path.join(_KATALOG_CZCIONEK, "DejaVuSans-Bold.ttf")))
# Bez tego znaczniki <b>...</b> wewnątrz Paragraph z fontName="DejaVu" i tak przełączałyby się
# na domyślną (bezpolską) Helvetica-Bold zamiast na DejaVu-Bold.
pdfmetrics.registerFontFamily("DejaVu", normal="DejaVu", bold="DejaVu-Bold", italic="DejaVu", boldItalic="DejaVu-Bold")

_STYLE = getSampleStyleSheet()
STYL_NAGLOWEK = ParagraphStyle("Naglowek", parent=_STYLE["Heading1"], fontName="DejaVu-Bold", fontSize=16, spaceAfter=4)
STYL_SEKCJA = ParagraphStyle("Sekcja", parent=_STYLE["Heading2"], fontName="DejaVu-Bold", fontSize=12, spaceAfter=6)
STYL_TEKST = ParagraphStyle("Tekst", parent=_STYLE["Normal"], fontName="DejaVu", fontSize=9, leading=12)
STYL_TEKST_WYSRODKOWANY = ParagraphStyle("TekstWysrodkowany", parent=STYL_TEKST, alignment=1)  # 1 = TA_CENTER
STYL_TEKST_UZASADNIONY = ParagraphStyle("TekstUzasadniony", parent=STYL_TEKST, alignment=4)  # 4 = TA_JUSTIFY
STYL_KOMORKA = ParagraphStyle("Komorka", parent=_STYLE["Normal"], fontName="DejaVu", fontSize=8, leading=10)
STYL_NAGLOWEK_TABELI = ParagraphStyle("NaglowekTabeli", parent=STYL_KOMORKA, fontName="DejaVu-Bold", textColor=colors.white)
# Numer paragrafu (§ N) jako osobny, wytłuszczony wiersz nad treścią, wyśrodkowany — nie
# wtopiony w tekst akapitu — żeby każdy paragraf był wizualnie wyraźnie oddzielony od
# poprzedniego (np. w umowie).
STYL_PARAGRAF = ParagraphStyle(
    "Paragraf", parent=_STYLE["Normal"], fontName="DejaVu-Bold", fontSize=10, spaceBefore=10, spaceAfter=4, alignment=1
)

ZLOTY = colors.HexColor("#b8934a")
TLO_NAPRZEMIENNE = colors.HexColor("#faf8f4")
OBRAMOWANIE = colors.HexColor("#e4dfd5")
