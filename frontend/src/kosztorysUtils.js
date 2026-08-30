// Buduje payload dla PUT /kosztorysy/{id} na podstawie już istniejącego, w pełni wypełnionego
// kosztorysu (np. pobranego z listy) — używane, gdy zmieniamy jedno pole (np. przy akceptacji),
// bez przechodzenia przez cały formularz edycji.
export function kosztorysDoPayloadu(kosztorys, nadpisania = {}) {
  return {
    klient_id: kosztorys.klient_id,
    nazwa_inwestycji: kosztorys.nazwa_inwestycji,
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
      opis: pozycja.opis,
      kolor: pozycja.kolor,
      oscieznica_rodzaj: pozycja.oscieznica_rodzaj,
      informacje_dodatkowe: pozycja.informacje_dodatkowe,
      szklo: pozycja.szklo,
      wentylacja: pozycja.wentylacja,
      uwagi: pozycja.uwagi,
      skladniki: pozycja.skladniki.map((skladnik) => ({ opis: skladnik.opis, kwota: skladnik.kwota })),
    })),
    ...nadpisania,
  }
}

// Zamienia pozycje z edytowalnego stanu formularza (PozycjeEditor — kwoty jako tekst)
// na kształt, jakiego oczekuje backend (kwoty jako liczby, puste teksty jako null).
export function pozycjeDoPayloadu(pozycje) {
  return pozycje.map((pozycja) => ({
    nazwa: pozycja.nazwa,
    dostawca_id: pozycja.dostawca_id === '' || pozycja.dostawca_id == null ? null : Number(pozycja.dostawca_id),
    opis: pozycja.opis || null,
    kolor: pozycja.kolor || null,
    oscieznica_rodzaj: pozycja.oscieznica_rodzaj || null,
    informacje_dodatkowe: pozycja.informacje_dodatkowe || null,
    szklo: pozycja.szklo || null,
    wentylacja: pozycja.wentylacja || null,
    uwagi: pozycja.uwagi || null,
    skladniki: pozycja.skladniki.map((skladnik) => ({
      opis: skladnik.opis,
      kwota: Number(skladnik.kwota) || 0,
    })),
  }))
}
