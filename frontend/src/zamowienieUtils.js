// Ogólny etap sprawy — od kosztorysu, przez zamówienie u dostawcy i montaż, do zamknięcia
// (albo serwisu/reklamacji, które mogą się zdarzyć już po montażu). Musi być zgodne
// z STATUSY_ZAMOWIENIA w app/schemas/zamowienie.py.
export const STATUSY_ZAMOWIENIA = [
  'Kosztorys',
  'Zamówić',
  'Montaż',
  'Do dokończenia',
  'Zakończone',
  'Serwis',
  'Reklamacja',
]

// Buduje payload dla PUT /zamowienia/{id} na podstawie już istniejącego, w pełni wypełnionego
// zamówienia (np. pobranego z listy) — używane, gdy zmieniamy jedno pole (np. status u dostawcy)
// bezpośrednio z listy, bez otwierania całego formularza edycji. PUT robi pełną podmianę,
// więc trzeba zawsze wysłać cały obiekt (patrz też kosztorysDoPayloadu w kosztorysUtils.js).
export function zamowienieDoPayloadu(zamowienie, nadpisania = {}) {
  return {
    kosztorys_id: zamowienie.kosztorys_id,
    dostawca_id: zamowienie.dostawca_id,
    status: zamowienie.status,
    status_zamowienia_dostawcy: zamowienie.status_zamowienia_dostawcy,
    adres_nabywcy: zamowienie.adres_nabywcy,
    adres_montazu: zamowienie.adres_montazu,
    numer_zamowienia: zamowienie.numer_zamowienia,
    data_zamowienia: zamowienie.data_zamowienia,
    termin_realizacji_tygodnie: zamowienie.termin_realizacji_tygodnie,
    uwagi: zamowienie.uwagi,
    data_dostawy: zamowienie.data_dostawy,
    magazyn: zamowienie.magazyn,
    braki_w_dostawie: zamowienie.braki_w_dostawie,
    zaliczka_producent: zamowienie.zaliczka_producent,
    doplata_producent: zamowienie.doplata_producent,
    wartosc_netto: zamowienie.wartosc_netto,
    vat_procent: zamowienie.vat_procent,
    zaliczka_klienta: zamowienie.zaliczka_klienta,
    data_zaliczki: zamowienie.data_zaliczki,
    doplacono: zamowienie.doplacono,
    dodaj_do_montazy: zamowienie.dodaj_do_montazy,
    ...nadpisania,
  }
}
