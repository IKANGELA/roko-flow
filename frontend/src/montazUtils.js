// Musi być zgodne z listą w MontazForm.jsx (i wcześniej tylko tam istniało jako sztywne opcje).
export const STATUSY_MONTAZU = ['Do ustalenia', 'Zaplanowano', 'Zrealizowano']

// Buduje payload dla PUT /montaze/{id} na podstawie już istniejącego, w pełni wypełnionego
// montażu (np. pobranego z listy) — używane przy zmianie statusu bezpośrednio z listy,
// bez otwierania całego formularza edycji. PUT robi pełną podmianę, więc trzeba zawsze
// wysłać cały obiekt (patrz też kosztorysDoPayloadu/zamowienieDoPayloadu).
export function montazDoPayloadu(montaz, nadpisania = {}) {
  return {
    kosztorys_id: montaz.kosztorys_id,
    data_montazu: montaz.data_montazu,
    godzina_montazu: montaz.godzina_montazu,
    co_do_montazu: montaz.co_do_montazu,
    nazwa_montazysty: montaz.nazwa_montazysty,
    status_montazu: montaz.status_montazu,
    uwagi_do_montazu: montaz.uwagi_do_montazu,
    oswiadczenie_zlozone: montaz.oswiadczenie_zlozone,
    zsynchronizowano_kalendarz: montaz.zsynchronizowano_kalendarz,
    ...nadpisania,
  }
}
