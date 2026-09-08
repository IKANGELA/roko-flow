"""
Generuje PDF kosztorysu z gotowych, już wyliczonych danych (schemat Kosztorys —
patrz app/services/kosztorys_service.py) i danych firmy z Ustawień. Nie liczy niczego
samodzielnie — tylko układa to, co już policzył KosztorysService, w dokument do druku.
"""

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.pdf._fonts import (
    OBRAMOWANIE as _OBRAMOWANIE,
    STYL_KOMORKA as _STYL_KOMORKA,
    STYL_NAGLOWEK as _STYL_NAGLOWEK,
    STYL_NAGLOWEK_TABELI as _STYL_NAGLOWEK_TABELI,
    STYL_TEKST as _STYL_TEKST,
    TLO_NAPRZEMIENNE as _TLO_NAPRZEMIENNE,
    ZLOTY as _ZLOTY,
)
from app.schemas.kosztorys import Kosztorys, Pozycja
from app.schemas.ustawienia import UstawieniaFirmy

# Kolejność i etykiety kolumn pozycji z własną kwotą — zgodna z PozycjeEditor.jsx (frontend).
_KOLUMNY_Z_CENA = [
    ("Montaż", None, "montaz_kwota"),
    ("Model/wzór", "opis", "opis_kwota"),
    ("Kolor", "kolor", "kolor_kwota"),
    ("Ościeżnica", "oscieznica_rodzaj", "oscieznica_rodzaj_kwota"),
    ("Informacje dodatkowe", "informacje_dodatkowe", "informacje_dodatkowe_kwota"),
    ("Szkło", "szklo", "szklo_kwota"),
    ("Wentylacja", "wentylacja", "wentylacja_kwota"),
    ("Uwagi", "uwagi", "uwagi_kwota"),
]


def _specyfikacja_pozycji(pozycja: Pozycja) -> str:
    """Łączy opisowe kolumny pozycji (i ich ceny) w jeden blok tekstu do komórki tabeli."""
    linie = []
    for etykieta, pole_tresci, pole_kwoty in _KOLUMNY_Z_CENA:
        tresc = getattr(pozycja, pole_tresci) if pole_tresci else None
        kwota = getattr(pozycja, pole_kwoty)
        if not tresc and not kwota:
            continue
        fragment = etykieta
        if tresc:
            fragment += f": {tresc}"
        if kwota:
            fragment += f" — {kwota:.2f} zł"
        linie.append(fragment)
    return "<br/>".join(linie) if linie else "—"


def _tabela_naglowka(wiersze: list[tuple[str, str]], szerokosci: list[float]) -> Table:
    tabela = Table(
        [[Paragraph(f"<b>{etykieta}</b>", _STYL_TEKST), Paragraph(wartosc, _STYL_TEKST)] for etykieta, wartosc in wiersze],
        colWidths=szerokosci,
    )
    tabela.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    return tabela


def zbuduj_pdf_kosztorysu(kosztorys: Kosztorys, ustawienia: UstawieniaFirmy) -> bytes:
    bufor = BytesIO()
    dokument = SimpleDocTemplate(
        bufor,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title=f"Kosztorys {kosztorys.numer}",
    )

    elementy = []

    # Nagłówek — dane firmy (Wykonawcy), z Ustawień, nigdy zaszyte w kodzie.
    if ustawienia.nazwa:
        elementy.append(Paragraph(ustawienia.nazwa, _STYL_NAGLOWEK))
    dane_firmy = " · ".join(filter(None, [ustawienia.adres, ustawienia.telefon, ustawienia.www, ustawienia.email]))
    if dane_firmy:
        elementy.append(Paragraph(dane_firmy, _STYL_TEKST))
    if ustawienia.nip:
        elementy.append(Paragraph(f"NIP: {ustawienia.nip}", _STYL_TEKST))
    elementy.append(Spacer(1, 0.6 * cm))

    elementy.append(Paragraph(f"Kosztorys {kosztorys.numer}", _STYL_NAGLOWEK))
    elementy.append(Paragraph(f"Data: {kosztorys.data.strftime('%Y-%m-%d')}", _STYL_TEKST))
    elementy.append(Spacer(1, 0.4 * cm))

    # Dane klienta i inwestycji
    elementy.append(
        _tabela_naglowka(
            [
                ("Klient", kosztorys.klient.imie_i_nazwisko),
                ("Telefon", kosztorys.klient.telefon),
                ("Nazwa inwestycji", kosztorys.nazwa_inwestycji or "—"),
                ("Adres nabywcy", kosztorys.adres_nabywcy or "—"),
                ("NIP nabywcy", kosztorys.nip_nabywcy or "—"),
                ("Adres montażu", kosztorys.adres_montazu or "—"),
                ("Termin", kosztorys.termin or "—"),
            ],
            [4 * cm, 12 * cm],
        )
    )
    elementy.append(Spacer(1, 0.6 * cm))

    # Tabela pozycji — wszystkie komórki jako Paragraph (nie gołe stringi), bo Table sama
    # z siebie renderuje gołe stringi domyślną (bezpolską) czcionką, ignorując FONTNAME z TableStyle
    # dopóki nie ustawimy go jawnie — Paragraph niesie własny styl, więc jest tu pewniejszy.
    wiersze_pozycji = [
        [Paragraph(tekst, _STYL_NAGLOWEK_TABELI) for tekst in ("Lp", "Nazwa", "Specyfikacja", "Netto")]
    ]
    for i, pozycja in enumerate(kosztorys.pozycje, start=1):
        wiersze_pozycji.append(
            [
                Paragraph(str(i), _STYL_KOMORKA),
                Paragraph(pozycja.nazwa, _STYL_KOMORKA),
                Paragraph(_specyfikacja_pozycji(pozycja), _STYL_KOMORKA),
                Paragraph(f"{pozycja.suma_netto:.2f} zł", _STYL_KOMORKA),
            ]
        )
    tabela_pozycji = Table(wiersze_pozycji, colWidths=[1 * cm, 4 * cm, 9.5 * cm, 2.5 * cm], repeatRows=1)
    tabela_pozycji.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), _ZLOTY),
                ("GRID", (0, 0), (-1, -1), 0.5, _OBRAMOWANIE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (3, 0), (3, -1), "RIGHT"),
                ("ALIGN", (0, 0), (0, -1), "CENTER"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, _TLO_NAPRZEMIENNE]),
            ]
        )
    )
    elementy.append(tabela_pozycji)
    elementy.append(Spacer(1, 0.6 * cm))

    # Podsumowanie finansowe — dokładnie te same liczby, co w aplikacji (patrz
    # KosztorysService._do_schematu), tylko ułożone do druku.
    tabela_podsumowania = Table(
        [
            [Paragraph(etykieta, _STYL_TEKST), Paragraph(f"<b>{wartosc}</b>", _STYL_TEKST)]
            for etykieta, wartosc in [
                ("Suma netto pozycji", f"{kosztorys.suma_netto_pozycji:.2f} zł"),
                ("Dodatkowe koszty", f"{kosztorys.dodatkowe_koszty:.2f} zł"),
                ("Rabat", f"-{kosztorys.rabat:.2f} zł"),
                ("Suma netto", f"{kosztorys.suma_netto:.2f} zł"),
                ("VAT", f"{kosztorys.vat_procent:.0f}%"),
                ("Suma brutto", f"{kosztorys.suma_brutto:.2f} zł"),
                ("Zaliczka", f"{kosztorys.zaliczka:.2f} zł"),
                ("Do dopłaty", f"{kosztorys.do_doplaty:.2f} zł"),
            ]
        ],
        colWidths=[4 * cm, 4 * cm],
        hAlign="RIGHT",
    )
    tabela_podsumowania.setStyle(TableStyle([("ALIGN", (1, 0), (1, -1), "RIGHT")]))
    elementy.append(tabela_podsumowania)

    if kosztorys.uwagi:
        elementy.append(Spacer(1, 0.5 * cm))
        elementy.append(Paragraph(f"<b>Uwagi:</b> {kosztorys.uwagi}", _STYL_TEKST))

    dokument.build(elementy)
    return bufor.getvalue()
