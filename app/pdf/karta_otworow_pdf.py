"""
Generuje PDF "Karty otworów do przygotowania" na podstawie kosztorysu — pusty formularz
pomiarowy, wypełniany ręcznie przez klienta/mierniczego. Wymiary otworów (szerokość,
wysokość, grubość ściany) nie są nigdzie w aplikacji śledzone jako liczby — to nie
przeoczenie, tylko świadoma decyzja (patrz [[pdf_documents]]) — dlatego te kolumny są
zawsze puste do ręcznego wypełnienia. Prewypełniamy tylko to, co już znamy: klienta,
adres pomiaru i nazwy pozycji z kosztorysu (jako podpowiedź "które drzwi to które").
"""

from datetime import date
from io import BytesIO

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.pdf._fonts import (
    OBRAMOWANIE,
    STYL_KOMORKA,
    STYL_NAGLOWEK,
    STYL_NAGLOWEK_TABELI,
    STYL_TEKST,
    STYL_TEKST_UZASADNIONY,
    ZLOTY,
)
from app.schemas.kosztorys import Kosztorys
from app.schemas.ustawienia import UstawieniaFirmy

# Formularz ma sens tylko dla tylu wierszy, ile jest pozycji w kosztorysie, plus zapas
# na dopisanie czegoś ręcznie na miejscu (np. drugi otwór dla tej samej pozycji).
_MINIMUM_WIERSZY = 15

_NAGLOWKI_KOLUMN = [
    "Lp",
    "Nazwa pomieszczenia",
    "Szerokość zamówionych drzwi",
    "Wysokość zamówionych drzwi",
    "Szerokość otworu do przygotowania",
    "Wysokość otworu do przygotowania (po podłogach)",
    "Grubość ściany (po tynkach, kafelkach)",
    "Strona otwierania (do środka / na zewnątrz)",
]


def zbuduj_pdf_karty_otworow(kosztorys: Kosztorys, ustawienia: UstawieniaFirmy) -> bytes:
    bufor = BytesIO()
    dokument = SimpleDocTemplate(
        bufor,
        pagesize=landscape(A4),
        leftMargin=1.2 * cm,
        rightMargin=1.2 * cm,
        topMargin=1.2 * cm,
        bottomMargin=1.2 * cm,
        title=f"Karta otworów {kosztorys.numer}",
    )

    elementy = [Paragraph("Karta otworów do przygotowania", STYL_NAGLOWEK), Spacer(1, 0.3 * cm)]

    dane_glowka = Table(
        [
            [
                Paragraph("Imię i nazwisko klienta:", STYL_TEKST),
                Paragraph(kosztorys.klient.imie_i_nazwisko, STYL_TEKST),
                Paragraph("Data:", STYL_TEKST),
                Paragraph(date.today().strftime("%Y-%m-%d"), STYL_TEKST),
            ],
            [
                Paragraph("Adres pomiaru:", STYL_TEKST),
                Paragraph(kosztorys.adres_montazu or "—", STYL_TEKST),
                "",
                "",
            ],
            [
                Paragraph("Telefon:", STYL_TEKST),
                Paragraph(kosztorys.klient.telefon, STYL_TEKST),
                "",
                "",
            ],
        ],
        colWidths=[3.5 * cm, 9 * cm, 2 * cm, 6 * cm],
    )
    dane_glowka.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    elementy.append(dane_glowka)
    elementy.append(Spacer(1, 0.5 * cm))

    elementy.append(Paragraph("<b>Prosimy o uważne przeczytanie tych informacji!</b>", STYL_TEKST))
    elementy.append(Spacer(1, 0.15 * cm))

    stawka = ustawienia.stawka_niedotrzymania_wymiarow or "……… zł netto"
    nazwa = ustawienia.nazwa or "Wykonawca"
    adres = ustawienia.adres or "—"
    tresc_informacji = (
        f"Firma {nazwa} z siedzibą w {adres} zobowiązuje się do wykonania drzwi dopasowanych "
        "do rozmiarów otworów drzwiowych, zawartych w karcie otworów do przygotowania, która "
        "jest załącznikiem umowy. Zamawiający (klient — inwestor) zobowiązuje się do "
        "przygotowania otworów drzwiowych, według ustalonych przez strony wymiarów zawartych "
        "w tabeli. W karcie dla inwestora klient (kupujący — inwestor) deklaruje jakie zostaną "
        "przygotowane otwory stolarki budowlanej typu: szerokość otworu, wysokość otworu po "
        "położonych wylewkach oraz podłogach, grubości ścian po położonych tynkach, glazurach "
        "etc. Niedotrzymanie wymiarów zawartych w tabeli może wiązać się z ewentualnym "
        f"podwyższeniem kosztów montażu drzwi, bądź niemożliwością ich zamontowania, za które "
        f"{nazwa} nie będzie ponosić odpowiedzialności, obciążając jednocześnie zamawiającego "
        f"kwotą {stawka} za 1 dzień roboczy dwóch ludzi."
    )
    elementy.append(Paragraph(tresc_informacji, STYL_TEKST_UZASADNIONY))
    elementy.append(Spacer(1, 0.5 * cm))

    liczba_wierszy = max(len(kosztorys.pozycje), _MINIMUM_WIERSZY)
    wiersze = [[Paragraph(f"<b>{n}</b>", STYL_NAGLOWEK_TABELI) for n in _NAGLOWKI_KOLUMN]]
    for i in range(1, liczba_wierszy + 1):
        nazwa_pomieszczenia = kosztorys.pozycje[i - 1].nazwa if i <= len(kosztorys.pozycje) else ""
        wiersze.append(
            [
                Paragraph(str(i), STYL_KOMORKA),
                Paragraph(nazwa_pomieszczenia, STYL_KOMORKA),
                "",
                "",
                "",
                "",
                "",
                "",
            ]
        )

    tabela = Table(
        wiersze,
        colWidths=[1 * cm, 4.5 * cm] + [3.7 * cm] * 6,
        repeatRows=1,
        rowHeights=[1.1 * cm] + [0.9 * cm] * liczba_wierszy,
    )
    tabela.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), ZLOTY),
                ("GRID", (0, 0), (-1, -1), 0.5, OBRAMOWANIE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ]
        )
    )
    elementy.append(tabela)
    elementy.append(Spacer(1, 0.5 * cm))

    legenda = Table(
        [
            [
                Paragraph("Rys. przykładowy", STYL_TEKST),
                Paragraph("<b>Opis strony otwierania drzwi</b>", STYL_TEKST),
                "",
            ],
            ["", Paragraph("Lewe na zewnątrz pomieszczenia", STYL_TEKST), Paragraph("-Lnz", STYL_TEKST)],
            ["", Paragraph("Prawe na zewnątrz pomieszczenia", STYL_TEKST), Paragraph("-Pnz", STYL_TEKST)],
            ["", Paragraph("Lewe do środka pomieszczenia", STYL_TEKST), Paragraph("-Lds", STYL_TEKST)],
            ["", Paragraph("Prawe do środka pomieszczenia", STYL_TEKST), Paragraph("-Pds", STYL_TEKST)],
        ],
        colWidths=[4 * cm, 6 * cm, 2 * cm],
    )
    elementy.append(legenda)

    dokument.build(elementy)
    return bufor.getvalue()
