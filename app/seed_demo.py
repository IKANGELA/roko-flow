"""
Wypełnia pustą bazę fikcyjnymi danymi demo — używane na publicznym demo (Render), gdzie
darmowy plan resetuje dysk (i bazę SQLite) przy każdym restarcie/redeployu. To tu celowo:
dzięki temu demo zawsze wraca do czystego, "ładnego" stanu, zamiast zostać puste albo
zaśmiecone zmianami przypadkowych odwiedzających. Żadne z tych danych nie są prawdziwymi
danymi firmy ROKO ani jej klientów — wszystko fikcyjne, wymyślone na potrzeby pokazu.
"""

from sqlalchemy.orm import Session

from app.models.dostawca import DostawcaDB
from app.models.klient import KlientDB
from app.models.ustawienia import UstawieniaFirmyDB
from app.repositories.kosztorys_repository import KosztorysRepository
from app.repositories.montaz_repository import MontazRepository
from app.repositories.ustawienia_repository import ID_SINGLETONA
from app.repositories.zamowienie_repository import ZamowienieRepository
from app.schemas.kosztorys import KosztorysCreate, PozycjaCreate
from app.schemas.montaz import MontazCreate
from app.schemas.zamowienie import ZamowienieCreate


def zasiej_dane_demo_jesli_puste(db: Session) -> None:
    # Baza już ma dane (praca lokalna na realnych danych) — nic nie robimy.
    if db.query(KlientDB).first() is not None:
        return

    db.add(
        UstawieniaFirmyDB(
            id=ID_SINGLETONA,
            nazwa="ProDrzwi Design",
            adres="ul. Przykładowa 12, 00-001 Warszawa",
            miejscowosc="Warszawa",
            nip="000-000-00-00",
            konto_bankowe="Bank Demo 00 0000 0000 0000 0000 0000 0000",
            telefon="000 000 000",
            email="kontakt@przyklad.pl",
            www="www.przyklad.pl",
            dane_rejestrowe="wpisaną do CEIDG",
            stawka_niedotrzymania_wymiarow="500 zł netto",
        )
    )

    dostawcy = [
        DostawcaDB(nazwa="Erkado", specyfikacja="drzwi"),
        DostawcaDB(nazwa="Polskone", specyfikacja="drzwi"),
        DostawcaDB(nazwa="VDS", specyfikacja="klamki"),
    ]
    db.add_all(dostawcy)

    klienci = [
        KlientDB(
            imie_i_nazwisko="Jan Kowalski",
            typ_klienta="Prywatny",
            telefon="600100200",
            email="jan.kowalski@przyklad.pl",
            adres="ul. Kwiatowa 5, 00-002 Warszawa",
        ),
        KlientDB(
            imie_i_nazwisko="Maria Nowak",
            typ_klienta="Prywatny",
            telefon="600200300",
            email="maria.nowak@przyklad.pl",
            adres="ul. Leśna 8, 00-003 Warszawa",
        ),
        KlientDB(
            imie_i_nazwisko="Studio Wnętrz Nowak Sp. z o.o.",
            typ_klienta="Firma",
            telefon="600300400",
            email="biuro@studio-demo.pl",
            adres="ul. Biurowa 3, 00-004 Warszawa",
            nip="000-111-22-33",
        ),
    ]
    db.add_all(klienci)
    # flush (nie commit) — żeby dostawcy/klienci dostali id z bazy, zanim odwołają się
    # do nich kosztorysy/pozycje niżej, bez kończenia jeszcze całej transakcji.
    db.flush()

    kosztorys_repo = KosztorysRepository(db)
    zamowienie_repo = ZamowienieRepository(db)
    montaz_repo = MontazRepository(db)

    kosztorys_zaakceptowany = kosztorys_repo.dodaj(
        KosztorysCreate(
            klient_id=klienci[0].id,
            nazwa_inwestycji="Mieszkanie na Kwiatowej",
            rodzaj_inwestycji="Mieszkaniowa",
            adres_nabywcy=klienci[0].adres,
            adres_montazu=klienci[0].adres,
            termin="2 tygodnie",
            uwagi="Klient prosi o kontakt telefoniczny przed montażem.",
            status="Zaakceptowany",
            vat_procent=8,
            pozycje=[
                PozycjaCreate(
                    nazwa="Drzwi do salonu",
                    dostawca_id=dostawcy[0].id,
                    montaz_kwota=300,
                    opis="Erkado Altamura, buk",
                    opis_kwota=1250,
                    kolor="buk",
                    oscieznica_rodzaj="regulowana",
                    oscieznica_rodzaj_kwota=480,
                ),
                PozycjaCreate(
                    nazwa="Drzwi do sypialni",
                    dostawca_id=dostawcy[0].id,
                    montaz_kwota=300,
                    opis="Erkado Covert, biały",
                    opis_kwota=980,
                ),
            ],
        )
    )

    kosztorys_repo.dodaj(
        KosztorysCreate(
            klient_id=klienci[1].id,
            nazwa_inwestycji="Dom jednorodzinny",
            rodzaj_inwestycji="Mieszkaniowa",
            adres_montazu=klienci[1].adres,
            termin="3 tygodnie",
            status="Oczekuje",
            vat_procent=8,
            pozycje=[
                PozycjaCreate(
                    nazwa="Drzwi wejściowe",
                    dostawca_id=dostawcy[1].id,
                    montaz_kwota=350,
                    opis="Polskone Prestige",
                    opis_kwota=2100,
                ),
            ],
        )
    )

    kosztorys_repo.dodaj(
        KosztorysCreate(
            klient_id=klienci[2].id,
            nazwa_inwestycji="Biuro — remont",
            rodzaj_inwestycji="Niemieszkaniowa",
            adres_montazu=klienci[2].adres,
            nip_nabywcy=klienci[2].nip,
            termin="4 tygodnie",
            status="Odrzucony",
            uwagi="Klient zdecydował się na innego wykonawcę.",
            vat_procent=23,
            pozycje=[
                PozycjaCreate(
                    nazwa="Drzwi biurowe x4",
                    dostawca_id=dostawcy[1].id,
                    montaz_kwota=800,
                    opis="Polskone Office",
                    opis_kwota=3600,
                ),
            ],
        )
    )

    # Suma netto pozycji kosztorysu zaakceptowanego: (300+1250+480) + (300+980) = 3310.
    zamowienie_repo.dodaj(
        ZamowienieCreate(
            kosztorys_id=kosztorys_zaakceptowany.id,
            klient_id=klienci[0].id,
            dostawca_id=dostawcy[0].id,
            status="Montaż",
            status_zamowienia_dostawcy="Zamówione kompletnie",
            adres_nabywcy=klienci[0].adres,
            adres_montazu=klienci[0].adres,
            numer_zamowienia="Z-001",
            wartosc_netto=3310,
            vat_procent=8,
            zaliczka_klienta=1429.92,
            doplacono=False,
        )
    )

    montaz_repo.dodaj(
        MontazCreate(
            kosztorys_id=kosztorys_zaakceptowany.id,
            co_do_montazu="Drzwi do salonu i sypialni",
            nazwa_montazysty="Ekipa A",
            status_montazu="Zaplanowano",
        )
    )

    db.commit()
