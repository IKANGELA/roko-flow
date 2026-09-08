"""
Generuje PDF umowy na podstawie kosztorysu (dane zamawiającego, cena, zaliczka, termin)
i danych Wykonawcy z Ustawień. Treść paragrafów jest stała (wzór umowy dostarczony przez
użytkownika) — zmienne są tylko miejsca oznaczone niżej jako podstawienia z Kosztorys/
UstawieniaFirmy. Nigdy nie zaszywamy tu nazwy firmy, NIP-u, numeru konta ani danych
rejestrowych na sztywno — to zawsze przychodzi z Ustawień, uzupełnianych przez użytkownika.
"""

from datetime import date
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.pdf._fonts import STYL_NAGLOWEK, STYL_TEKST, STYL_TEKST_UZASADNIONY
from app.schemas.kosztorys import Kosztorys
from app.schemas.ustawienia import UstawieniaFirmy


def _naglowek_firmy(ustawienia: UstawieniaFirmy, numer_umowy: str) -> Table:
    lewa = []
    if ustawienia.nazwa:
        lewa.append(Paragraph(f"<b>{ustawienia.nazwa}</b>", STYL_TEKST))
    if ustawienia.adres:
        lewa.append(Paragraph(ustawienia.adres, STYL_TEKST))
    kontakt = " · ".join(filter(None, [ustawienia.www, f"tel. {ustawienia.telefon}" if ustawienia.telefon else None]))
    if kontakt:
        lewa.append(Paragraph(kontakt, STYL_TEKST))
    if ustawienia.konto_bankowe:
        lewa.append(Paragraph(f"Nr konta: {ustawienia.konto_bankowe}", STYL_TEKST))

    prawa = [
        Paragraph(f"Data zawarcia umowy: {date.today().strftime('%Y-%m-%d')}", STYL_TEKST),
        Spacer(1, 0.3 * cm),
        Paragraph(f"Numer umowy: <b>{numer_umowy}</b>", STYL_TEKST),
    ]
    if ustawienia.miejscowosc:
        prawa.append(Spacer(1, 0.3 * cm))
        prawa.append(Paragraph(f"{ustawienia.miejscowosc}, dnia {date.today().strftime('%Y-%m-%d')}", STYL_TEKST))

    tabela = Table([[lewa, prawa]], colWidths=[9 * cm, 9 * cm])
    tabela.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    return tabela


def _strony_umowy(kosztorys: Kosztorys, ustawienia: UstawieniaFirmy) -> Table:
    wiersze = [
        [Paragraph("Pomiędzy:", STYL_TEKST), ""],
        [Paragraph(kosztorys.klient.imie_i_nazwisko, STYL_TEKST), ""],
        [Paragraph("Adres:", STYL_TEKST), Paragraph(kosztorys.adres_nabywcy or "—", STYL_TEKST)],
        [Paragraph("Adres montażu:", STYL_TEKST), Paragraph(kosztorys.adres_montazu or "—", STYL_TEKST)],
        [Paragraph("Telefon:", STYL_TEKST), Paragraph(kosztorys.klient.telefon, STYL_TEKST)],
        [Paragraph("zwanym Zamawiającym", STYL_TEKST), ""],
    ]
    tabela = Table(wiersze, colWidths=[4 * cm, 14 * cm])
    tabela.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))

    dane_rejestrowe = f", {ustawienia.dane_rejestrowe}" if ustawienia.dane_rejestrowe else ""
    tresc_wykonawcy = (
        f"a firmą {ustawienia.nazwa or '—'}, {ustawienia.adres or '—'}{dane_rejestrowe}, "
        "zwanym dalej Wykonawcą"
    )
    return [tabela, Spacer(1, 0.3 * cm), Paragraph(tresc_wykonawcy, STYL_TEKST_UZASADNIONY)]


def _paragrafy_umowy(kosztorys: Kosztorys, ustawienia: UstawieniaFirmy) -> list:
    """
    Stała treść umowy (wzór dostarczony przez użytkownika) z podstawieniami w miejscach
    zmiennych: cena, zaliczka, termin — z kosztorysu; adres/kontakt/e-mail Wykonawcy — z Ustawień.
    """
    nazwa = ustawienia.nazwa or "Wykonawcę"
    adres = ustawienia.adres or "—"
    email = ustawienia.email or "—"

    tresci = [
        "Wykonawca zobowiązuje się do dostarczenia i zamontowania przedmiotu umowy bez wad, "
        "zaś Zamawiający zobowiązuje się do zapłaty umówionej ceny oraz przygotowania i "
        "udostępnienia miejsca montażu.",
        "Szczegółowe zestawienie przedmiotu umowy zawarte jest w poniższych załącznikach, "
        "stanowiących integralną część umowy: kosztorys zawierający parametry zamówienia, "
        "cechy zamówionego towaru, usługi montażu oraz cenę. Zamawiający oświadcza, że "
        "zamawia towar nietypowy (nieprefabrykowany), przygotowany według specyfikacji "
        "Zamawiającego i zgodnie z jego indywidualnymi potrzebami, który nie podlega zwrotowi. "
        "Zamawiającemu nie przysługuje prawo do odstąpienia od tej umowy bez podawania "
        "przyczyny i bez ponoszenia kosztów w przypadku zawarcia jej poza lokalem "
        "przedsiębiorstwa, co nie wyłącza innych uprawnień wynikających z rękojmi i gwarancji. "
        "Załącznik: kosztorys zawierający parametry zamówienia oraz cenę.",
        f"Strony ustaliły cenę na kwotę brutto: <b>{kosztorys.suma_brutto:.2f} zł</b>. W tej cenie "
        "zawiera się dostarczenie i zamontowanie zamówionego towaru, chyba że kosztorys "
        "stanowi inaczej.",
        f"Termin realizacji przedmiotu umowy następuje: <b>{kosztorys.termin or 'do ustalenia'}</b>.",
        "Po dostarczeniu i zamontowaniu lub odebraniu przedmiotu umowy i zapłacie należnego "
        "wynagrodzenia ustalonego wyżej, Wykonawca przenosi własność na Zamawiającego. "
        "Wykonawca zastrzega sobie własność sprzedanych rzeczy aż do uiszczenia pełnej ceny.",
        "a) Zamawiający nie później niż w dniu podpisania umowy wpłaca zaliczkę w wysokości "
        f"nie mniejszej niż 40% wartości umowy, tj. <b>{kosztorys.zaliczka:.2f} zł</b>. "
        "b) Zamawiający dopłaci pozostałą część należności do wysokości co najmniej 95% "
        "wartości zamówienia, najpóźniej w ciągu 7 dni przed terminem realizacji umowy, w "
        "przeciwnym razie termin montażu może ulec zmianie i nastąpi w innym bliżej "
        "nieokreślonym terminie. c) Po dopłacie do wartości 95% umowy następuje ustalenie "
        "terminu montażu. d) Pozostałe 5% najpóźniej w dniu montażu gotówką.",
        "W przypadku odstąpienia od umowy przez Zamawiającego lub z jego winy, zaliczka "
        "pozostaje u Wykonawcy.",
        "W razie niemożności zrealizowania przedmiotu umowy z winy Wykonawcy, zaliczka "
        "podlega zwrotowi.",
        "Rozpoczęcie realizacji zamówienia następuje po uzgodnieniu przez strony wszystkich "
        "niezbędnych parametrów jego wykonania oraz po wpłacie zaliczki. W przeciwnym razie, "
        "termin wykonania może się wydłużyć. Wszelkie zmiany parametrów zamówienia wymagają "
        "formy pisemnej wraz z datą, pod rygorem nieważności. Zmiana parametrów przedłuża bieg "
        "terminu realizacji przedmiotu umowy. Jeżeli zmiana parametrów wpływa na koszty "
        "wykonania przedmiotu umowy, wymagana jest zgoda obu stron.",
        "Nieodebranie przedmiotu umowy lub uniemożliwienie montażu w ciągu 14 dni od dnia "
        "zgłoszonej gotowości, uznawane jest za odstąpienie od umowy z winy Zamawiającego.",
        "Wykonanie umowy zostanie potwierdzone w protokole odbioru robót budowlano-"
        "montażowych, przez Zamawiającego czytelnym podpisem. Termin odbioru jest jednocześnie "
        "terminem zakończenia montażu, uzgodnionego z Zamawiającym. Przed rozpoczęciem montażu "
        "Zamawiający jest zobowiązany sprawdzić kompletność, jakość towaru oraz zgodność z "
        "zamówieniem. W przypadku wystąpienia uszkodzeń należy je opisać w protokole odbioru. "
        "Wykonawca, w przypadku nieobecności zamawiającego przy odbiorze robót, ma prawo "
        "sporządzić protokół jednostronny.",
        "W momencie opóźnienia realizacji zawinionego przez Wykonawcę wartość usługi podlega "
        "obniżeniu o 0,05% za każdy dzień roboczy zwłoki. W momencie opóźnienia w dopłacie "
        "przez Zamawiającego nalicza się również odsetki w wysokości 0,05% za każdy dzień "
        "roboczy zwłoki. Odsetki nie dotyczą produktów, na które zgłoszono reklamację.",
        "Wykonawca oświadcza, że ponosi odpowiedzialność za jakość świadczonych usług montażu "
        "zamówionego towaru.",
        "Wykonawca oświadcza, że w ramach usług po sprzedażowych oferuje regulacje "
        "zamontowanych okien i drzwi w ciągu 6 miesięcy od daty montażu, przy czym po tym "
        "okresie usługa ta jest odpłatna, wraz z kosztami dojazdu.",
        "Okres gwarancji na zamówiony towar określa gwarancja producenta (oddzielny dokument) "
        "w formie pisemnej.",
        "Wszelkie kwestie związane z realizacją, zawarciem umowy oraz ewentualnym zgłoszeniem "
        f"wad powinny być kierowane w formie pisemnej na adres Wykonawcy: {adres}.",
        "Wszelkie płatności na rzecz Wykonawcy związane z tą umową powinny być dokonane na "
        f"rachunek bankowy {ustawienia.konto_bankowe or '—'} lub w siedzibie Wykonawcy: {adres}.",
        "W sprawach nieuregulowanych niniejszą umową zastosowanie mają przepisy Kodeksu "
        "Cywilnego oraz Ustawy o prawach konsumenta.",
        "Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze "
        "stron.",
        "Warunki umowy akceptuję i jednocześnie upoważniam "
        f"{nazwa} do wystawienia faktury VAT bez podpisu. Do czasu uregulowania pełnej kwoty "
        "(brutto) wynikającej z umowy towar pozostaje własnością Wykonawcy.",
        "Podpisując umowę wyrażam zgodę na wykonywanie zdjęć zamontowanych produktów na "
        "potrzeby profilu FB i strony internetowej Wykonawcy. Zdjęcia nie obejmują danych "
        "osobowych, teleadresowych ani żadnych innych umożliwiających identyfikację "
        "inwestora.",
        f"Oświadczam również, że wyrażam zgodę na przetwarzanie swoich danych osobowych przez "
        f"Wykonawcę ({nazwa}) w celu marketingu bezpośredniego dotyczącego świadczonych usług. "
        "Dane w tym celu przetwarzane są na podstawie art. 6 ust. 1 lit. a Rozporządzenia "
        "Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 roku w sprawie "
        "ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie "
        "swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO). Dane "
        "będą przechowywane przez okres 10 lat. Osoba, której dane dotyczą, ma prawo wniesienia "
        "sprzeciwu oraz prawo do cofnięcia zgody w dowolnym momencie, bez wpływu na zgodność z "
        "prawem przetwarzania dokonanego przed jej cofnięciem. W tym celu można wysłać "
        f"wiadomość e-mail na adres: {email}.",
        "<b>Oświadczenie o powierzchni użytkowej:</b><br/>"
        "Ja, niżej podpisany(a), oświadczam, że w firmie "
        f"{nazwa} zamawiam towar z usługą montażu do: domu wolnostojącego / mieszkania w "
        "zabudowie wielorodzinnej * nie przekraczającego 300 / 150 * metrów kwadratowych "
        "powierzchni użytkowej. (* niepodkreślone skreślić; jeśli powierzchnia przekracza "
        "limit, podać dokładny metraż: ……………… m²)<br/>"
        "Podstawa prawna: art. 5 ust. 1 pkt 1, art. 19 ust. 13 pkt 10, art. 41 ust. 12, art. 43 "
        "ust. 1 pkt 10 w związku z art. 43 ust. 7 ustawy z 11 marca 2004 r. o podatku od "
        "towarów i usług.",
    ]

    elementy = []
    for numer, tresc in enumerate(tresci, start=1):
        elementy.append(Paragraph(f"<b>§ {numer}</b> {tresc}", STYL_TEKST_UZASADNIONY))
        elementy.append(Spacer(1, 0.25 * cm))
    return elementy


def _podpisy() -> Table:
    tabela = Table(
        [[Paragraph("Zamawiający:", STYL_TEKST), Paragraph("Wykonawca:", STYL_TEKST)]],
        colWidths=[9 * cm, 9 * cm],
    )
    tabela.setStyle(TableStyle([("TOPPADDING", (0, 0), (-1, -1), 1.5 * cm)]))
    return tabela


def zbuduj_pdf_umowy(kosztorys: Kosztorys, ustawienia: UstawieniaFirmy) -> bytes:
    bufor = BytesIO()
    dokument = SimpleDocTemplate(
        bufor,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title=f"Umowa {kosztorys.numer}",
    )

    elementy = [
        _naglowek_firmy(ustawienia, kosztorys.numer),
        Spacer(1, 0.6 * cm),
        Paragraph("Umowa", STYL_NAGLOWEK),
        Spacer(1, 0.3 * cm),
        *_strony_umowy(kosztorys, ustawienia),
        Spacer(1, 0.5 * cm),
        *_paragrafy_umowy(kosztorys, ustawienia),
        Spacer(1, 0.5 * cm),
        _podpisy(),
    ]

    dokument.build(elementy)
    return bufor.getvalue()
