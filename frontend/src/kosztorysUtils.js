// Buduje payload dla PUT /kosztorysy/{id} na podstawie już istniejącego, w pełni wypełnionego
// kosztorysu (np. pobranego z listy) — używane, gdy zmieniamy jedno pole (np. przy akceptacji),
// bez przechodzenia przez cały formularz edycji.
export function kosztorysDoPayloadu(kosztorys, nadpisania = {}) {
  return {
    klient_id: kosztorys.klient_id,
    nazwa_inwestycji: kosztorys.nazwa_inwestycji,
    adres_nabywcy: kosztorys.adres_nabywcy,
    nip_nabywcy: kosztorys.nip_nabywcy,
    adres_montazu: kosztorys.adres_montazu,
    termin: kosztorys.termin,
    uwagi: kosztorys.uwagi,
    wybrany_do_realizacji: kosztorys.wybrany_do_realizacji,
    vat_procent: kosztorys.vat_procent,
    dodatkowe_koszty: kosztorys.dodatkowe_koszty,
    rabat: kosztorys.rabat,
    ustalona_zaliczka: kosztorys.ustalona_zaliczka,
    pozycje: kosztorys.pozycje.map((pozycja) => ({
      nazwa: pozycja.nazwa,
      dostawca_id: pozycja.dostawca_id,
      montaz_kwota: pozycja.montaz_kwota,
      opis: pozycja.opis,
      opis_kwota: pozycja.opis_kwota,
      kolor: pozycja.kolor,
      kolor_kwota: pozycja.kolor_kwota,
      oscieznica_rodzaj: pozycja.oscieznica_rodzaj,
      oscieznica_rodzaj_kwota: pozycja.oscieznica_rodzaj_kwota,
      informacje_dodatkowe: pozycja.informacje_dodatkowe,
      informacje_dodatkowe_kwota: pozycja.informacje_dodatkowe_kwota,
      szklo: pozycja.szklo,
      szklo_kwota: pozycja.szklo_kwota,
      wentylacja: pozycja.wentylacja,
      wentylacja_kwota: pozycja.wentylacja_kwota,
      uwagi: pozycja.uwagi,
      uwagi_kwota: pozycja.uwagi_kwota,
    })),
    ...nadpisania,
  }
}

// Pole tekstowe -> null, jeśli puste; pole z kwotą (tekst z inputa) -> liczba albo null, jeśli puste.
function pustyTekstNaNull(wartosc) {
  return wartosc || null
}

function pustaKwoteNaNull(wartosc) {
  return wartosc === '' || wartosc == null ? null : Number(wartosc)
}

// Zamienia pozycje z edytowalnego stanu formularza (PozycjeEditor — kwoty jako tekst)
// na kształt, jakiego oczekuje backend (kwoty jako liczby, puste pola jako null).
export function pozycjeDoPayloadu(pozycje) {
  return pozycje.map((pozycja) => ({
    nazwa: pozycja.nazwa,
    dostawca_id: pozycja.dostawca_id === '' || pozycja.dostawca_id == null ? null : Number(pozycja.dostawca_id),
    montaz_kwota: pustaKwoteNaNull(pozycja.montaz_kwota),
    opis: pustyTekstNaNull(pozycja.opis),
    opis_kwota: pustaKwoteNaNull(pozycja.opis_kwota),
    kolor: pustyTekstNaNull(pozycja.kolor),
    kolor_kwota: pustaKwoteNaNull(pozycja.kolor_kwota),
    oscieznica_rodzaj: pustyTekstNaNull(pozycja.oscieznica_rodzaj),
    oscieznica_rodzaj_kwota: pustaKwoteNaNull(pozycja.oscieznica_rodzaj_kwota),
    informacje_dodatkowe: pustyTekstNaNull(pozycja.informacje_dodatkowe),
    informacje_dodatkowe_kwota: pustaKwoteNaNull(pozycja.informacje_dodatkowe_kwota),
    szklo: pustyTekstNaNull(pozycja.szklo),
    szklo_kwota: pustaKwoteNaNull(pozycja.szklo_kwota),
    wentylacja: pustyTekstNaNull(pozycja.wentylacja),
    wentylacja_kwota: pustaKwoteNaNull(pozycja.wentylacja_kwota),
    uwagi: pustyTekstNaNull(pozycja.uwagi),
    uwagi_kwota: pustaKwoteNaNull(pozycja.uwagi_kwota),
  }))
}
