import { useEffect, useRef, useState } from 'react'
import KlientPicker from './KlientPicker'
import PozycjeEditor from './PozycjeEditor'
import {
  aktualizujKosztorys,
  aktualizujZamowienie,
  pobierzDostawcow,
  pobierzKosztorysy,
  utworzZamowienie,
} from '../api'
import { kosztorysDoPayloadu, pozycjeDoPayloadu } from '../kosztorysUtils'
import { STATUSY_ZAMOWIENIA } from '../zamowienieUtils'

const PUSTY_FORMULARZ = {
  kosztorys_id: '',
  klient_id: null,
  dostawca_id: '',
  status: 'Zamówić',
  status_zamowienia_dostawcy: 'Do zamówienia',
  adres_nabywcy: '',
  nip_nabywcy: '',
  adres_montazu: '',
  numer_zamowienia: '',
  data_zamowienia: '',
  termin_realizacji_tygodnie: '',
  uwagi: '',
  data_dostawy: '',
  magazyn: '',
  braki_w_dostawie: '',
  zaliczka_producent: 0,
  doplata_producent: 0,
  wartosc_netto: '',
  vat_procent: 8,
  zaliczka_klienta: 0,
  data_zaliczki: '',
  doplacono: false,
  dodaj_do_montazy: false,
}

// Pola podpowiadane z kosztorysu przy jego wyborze — jedno miejsce, żeby nie rozjeżdżały
// się między ręczną zmianą (zmienKosztorys) a wejściem z wstepnyKosztorysId (np. po
// "Akceptuj" na kosztorysie), gdzie zmienKosztorys nie jest wywoływane.
function polaZKosztorysu(kosztorys) {
  return {
    klient_id: kosztorys.klient_id,
    vat_procent: kosztorys.vat_procent,
    adres_nabywcy: kosztorys.adres_nabywcy || '',
    nip_nabywcy: kosztorys.nip_nabywcy || '',
    adres_montazu: kosztorys.adres_montazu || '',
  }
}

function danePoczatkowe(zamowienie, wstepnyKosztorysId) {
  if (zamowienie) {
    return {
      kosztorys_id: zamowienie.kosztorys_id ?? '',
      klient_id: zamowienie.klient_id ?? null,
      dostawca_id: zamowienie.dostawca_id ?? '',
      status: zamowienie.status,
      status_zamowienia_dostawcy: zamowienie.status_zamowienia_dostawcy || 'Do zamówienia',
      adres_nabywcy: zamowienie.adres_nabywcy || '',
      nip_nabywcy: zamowienie.nip_nabywcy || '',
      adres_montazu: zamowienie.adres_montazu || '',
      numer_zamowienia: zamowienie.numer_zamowienia || '',
      data_zamowienia: zamowienie.data_zamowienia || '',
      termin_realizacji_tygodnie: zamowienie.termin_realizacji_tygodnie ?? '',
      uwagi: zamowienie.uwagi || '',
      data_dostawy: zamowienie.data_dostawy || '',
      magazyn: zamowienie.magazyn || '',
      braki_w_dostawie: zamowienie.braki_w_dostawie || '',
      zaliczka_producent: zamowienie.zaliczka_producent,
      doplata_producent: zamowienie.doplata_producent,
      wartosc_netto: zamowienie.wartosc_netto ?? '',
      vat_procent: zamowienie.vat_procent,
      zaliczka_klienta: zamowienie.zaliczka_klienta,
      data_zaliczki: zamowienie.data_zaliczki || '',
      doplacono: zamowienie.doplacono,
      dodaj_do_montazy: zamowienie.dodaj_do_montazy,
    }
  }
  if (wstepnyKosztorysId) {
    return { ...PUSTY_FORMULARZ, kosztorys_id: wstepnyKosztorysId }
  }
  return PUSTY_FORMULARZ
}

function ZamowienieForm({ zamowienie, wstepnyKosztorysId, onZapisano }) {
  const jestEdycja = Boolean(zamowienie)

  const [kosztorysy, setKosztorysy] = useState([])
  const [dostawcy, setDostawcy] = useState([])
  const [dane, setDane] = useState(() => danePoczatkowe(zamowienie, wstepnyKosztorysId))
  const [zapisywanie, setZapisywanie] = useState(false)
  const [blad, setBlad] = useState(null)

  const [pozycje, setPozycje] = useState([])
  const [statusZapisuPozycji, setStatusZapisuPozycji] = useState(null) // null | 'zapisywanie' | 'zapisano' | 'blad'
  const zaladowanyKosztorysId = useRef(null)

  // Migawka ostatnio zapisanych pozycji — porównanie z bieżącym stanem mówi, czy są
  // niezapisane zmiany (podświetlenie przycisku "Zapisz" przy pozycji, patrz niżej).
  const zapisanePozycjeRef = useRef('[]')
  const pozycjeNiezapisane = JSON.stringify(pozycje) !== zapisanePozycjeRef.current

  useEffect(() => {
    pobierzKosztorysy().then(setKosztorysy)
    pobierzDostawcow().then(setDostawcy)
  }, [])

  // Wczytuje pozycje wybranego kosztorysu do edycji — tylko raz na dany kosztorys,
  // żeby nie nadpisywać tego, co użytkownik właśnie edytuje.
  useEffect(() => {
    if (!dane.kosztorys_id) {
      setPozycje([])
      zaladowanyKosztorysId.current = null
      return
    }
    if (zaladowanyKosztorysId.current === dane.kosztorys_id) {
      return
    }
    const wybrany = kosztorysy.find((k) => String(k.id) === String(dane.kosztorys_id))
    if (!wybrany) {
      return
    }
    const wczytanePozycje = wybrany.pozycje.map((pozycja) => ({
      nazwa: pozycja.nazwa,
      dostawca_id: pozycja.dostawca_id ?? '',
      montaz_kwota: pozycja.montaz_kwota ?? '',
      opis: pozycja.opis || '',
      opis_kwota: pozycja.opis_kwota ?? '',
      kolor: pozycja.kolor || '',
      kolor_kwota: pozycja.kolor_kwota ?? '',
      oscieznica_rodzaj: pozycja.oscieznica_rodzaj || '',
      oscieznica_rodzaj_kwota: pozycja.oscieznica_rodzaj_kwota ?? '',
      informacje_dodatkowe: pozycja.informacje_dodatkowe || '',
      informacje_dodatkowe_kwota: pozycja.informacje_dodatkowe_kwota ?? '',
      szklo: pozycja.szklo || '',
      szklo_kwota: pozycja.szklo_kwota ?? '',
      wentylacja: pozycja.wentylacja || '',
      wentylacja_kwota: pozycja.wentylacja_kwota ?? '',
      uwagi: pozycja.uwagi || '',
      uwagi_kwota: pozycja.uwagi_kwota ?? '',
    }))
    setPozycje(wczytanePozycje)
    zapisanePozycjeRef.current = JSON.stringify(wczytanePozycje)
    zaladowanyKosztorysId.current = dane.kosztorys_id
    // Bezpiecznik dla wejścia z wstepnyKosztorysId (np. po "Akceptuj" na kosztorysie) —
    // wtedy kosztorys_id jest ustawiony od razu, zanim lista kosztorysów się wczyta,
    // więc zmienKosztorys() (wywoływane tylko przy ręcznym wyborze) jeszcze nie zadziałało.
    // Efekt odpala się raz na kosztorys_id (patrz warunek wyżej), więc bezpiecznie nadpisuje
    // te same pola, które przy ręcznym wyborze ustawia zmienKosztorys.
    setDane((poprzednie) => ({ ...poprzednie, ...polaZKosztorysu(wybrany) }))
  }, [dane.kosztorys_id, kosztorysy])

  function zmienPole(event) {
    const { name, value } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: value }))
  }

  function zmienCheckbox(event) {
    const { name, checked } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: checked }))
  }

  // Wybór klienta podpowiada jego adres jako adres nabywcy (do faktury) — zwykle taki sam,
  // a nadal można go ręcznie zmienić, jeśli akurat różni się od adresu klienta.
  function zmienKlienta(klient) {
    setDane((poprzednie) => ({
      ...poprzednie,
      klient_id: klient ? klient.id : null,
      adres_nabywcy: klient ? klient.adres || '' : poprzednie.adres_nabywcy,
      nip_nabywcy: klient ? klient.nip || '' : poprzednie.nip_nabywcy,
    }))
  }

  function zmienKosztorys(event) {
    const nowyId = event.target.value
    // Podpowiadamy klienta, VAT i adresy z wybranego kosztorysu — nadal można je ręcznie zmienić.
    const wybrany = kosztorysy.find((k) => String(k.id) === nowyId)
    setDane((poprzednie) => ({
      ...poprzednie,
      kosztorys_id: nowyId,
      ...(wybrany ? polaZKosztorysu(wybrany) : {}),
    }))
  }

  // Kosztorysy pobrane z API mają już w sobie pełną listę pozycji — nie trzeba
  // dociągać jej osobno, żeby pokazać podgląd tego, co jest wycenione.
  const wybranyKosztorys = kosztorysy.find((k) => String(k.id) === String(dane.kosztorys_id))

  // Pozycje należą do kosztorysu, nie do zamówienia — zapisujemy je więc bezpośrednio
  // do kosztorysu (PUT), niezależnie od zapisu samego zamówienia. Dzięki temu np. dobór
  // klamek ustalony już po złożeniu zamówienia można dopisać z tego samego ekranu.
  async function zapiszPozycjeKosztorysu() {
    if (!wybranyKosztorys) {
      setBlad('Wybierz kosztorys, zanim zapiszesz pozycje.')
      return
    }
    setBlad(null)
    setStatusZapisuPozycji('zapisywanie')
    try {
      const payload = kosztorysDoPayloadu(wybranyKosztorys, { pozycje: pozycjeDoPayloadu(pozycje) })
      const zaktualizowanyKosztorys = await aktualizujKosztorys(wybranyKosztorys.id, payload)
      setKosztorysy((poprzednie) =>
        poprzednie.map((k) => (k.id === zaktualizowanyKosztorys.id ? zaktualizowanyKosztorys : k)),
      )
      setStatusZapisuPozycji('zapisano')
      zapisanePozycjeRef.current = JSON.stringify(pozycje)
    } catch (e) {
      setStatusZapisuPozycji('blad')
    }
  }

  const wartoscBrutto = dane.wartosc_netto === '' ? 0 : Number(dane.wartosc_netto) * (1 + Number(dane.vat_procent) / 100)
  const doDoplaty = dane.wartosc_netto === '' ? null : wartoscBrutto - (Number(dane.zaliczka_klienta) || 0)

  async function wyslij(event) {
    event.preventDefault()

    setZapisywanie(true)
    setBlad(null)

    const daneDoWyslania = {
      kosztorys_id: dane.kosztorys_id === '' ? null : Number(dane.kosztorys_id),
      klient_id: dane.klient_id,
      dostawca_id: dane.dostawca_id === '' ? null : Number(dane.dostawca_id),
      status: dane.status,
      status_zamowienia_dostawcy: dane.status_zamowienia_dostawcy,
      adres_nabywcy: dane.adres_nabywcy || null,
      nip_nabywcy: dane.nip_nabywcy || null,
      adres_montazu: dane.adres_montazu || null,
      numer_zamowienia: dane.numer_zamowienia || null,
      data_zamowienia: dane.data_zamowienia || null,
      termin_realizacji_tygodnie: dane.termin_realizacji_tygodnie === '' ? null : Number(dane.termin_realizacji_tygodnie),
      uwagi: dane.uwagi || null,
      data_dostawy: dane.data_dostawy || null,
      magazyn: dane.magazyn || null,
      braki_w_dostawie: dane.braki_w_dostawie || null,
      zaliczka_producent: Number(dane.zaliczka_producent) || 0,
      doplata_producent: Number(dane.doplata_producent) || 0,
      wartosc_netto: dane.wartosc_netto === '' ? null : Number(dane.wartosc_netto),
      vat_procent: Number(dane.vat_procent),
      zaliczka_klienta: Number(dane.zaliczka_klienta) || 0,
      data_zaliczki: dane.data_zaliczki || null,
      doplacono: dane.doplacono,
      dodaj_do_montazy: dane.dodaj_do_montazy,
    }

    try {
      const zapisane = jestEdycja
        ? await aktualizujZamowienie(zamowienie.id, daneDoWyslania)
        : await utworzZamowienie(daneDoWyslania)
      onZapisano(zapisane)
      if (!jestEdycja) {
        setDane(PUSTY_FORMULARZ)
      }
    } catch (e) {
      setBlad(jestEdycja ? 'Nie udało się zaktualizować zamówienia.' : 'Nie udało się zapisać zamówienia.')
    } finally {
      setZapisywanie(false)
    }
  }

  return (
    <form className="pelny-formularz" onSubmit={wyslij}>
      <fieldset>
        <legend>Dane zamówienia</legend>

        <KlientPicker klientId={dane.klient_id} onZmiana={zmienKlienta} wymagany={false} />

        <div className="siatka-pol">
          <label>
            Kosztorys (opcjonalnie)
            <select name="kosztorys_id" value={dane.kosztorys_id} onChange={zmienKosztorys}>
              <option value="">-- bez kosztorysu --</option>
              {kosztorysy.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.numer} — {k.klient.imie_i_nazwisko}
                  {k.nazwa_inwestycji ? ` (${k.nazwa_inwestycji})` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Dostawca (można uzupełnić później)
            <select name="dostawca_id" value={dane.dostawca_id} onChange={zmienPole}>
              <option value="">-- jeszcze nieznany --</option>
              {dostawcy.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nazwa}
                  {d.specyfikacja ? ` (${d.specyfikacja})` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="status" value={dane.status} onChange={zmienPole}>
              {STATUSY_ZAMOWIENIA.map((wartosc) => (
                <option key={wartosc} value={wartosc}>
                  {wartosc}
                </option>
              ))}
            </select>
          </label>
          <label>
            Zamówione u dostawcy
            <select name="status_zamowienia_dostawcy" value={dane.status_zamowienia_dostawcy} onChange={zmienPole}>
              <option value="Do zamówienia">Do zamówienia</option>
              <option value="Zamówione częściowo">Zamówione częściowo</option>
              <option value="Zamówione kompletnie">Zamówione kompletnie</option>
            </select>
          </label>
          <label>
            Adres nabywcy (do faktury)
            <input name="adres_nabywcy" value={dane.adres_nabywcy} onChange={zmienPole} />
          </label>
          <label>
            NIP nabywcy
            <input name="nip_nabywcy" value={dane.nip_nabywcy} onChange={zmienPole} />
          </label>
          <label>
            Adres montażu
            <input name="adres_montazu" value={dane.adres_montazu} onChange={zmienPole} />
          </label>

          <label>
            Numer zamówienia (u dostawcy)
            <input name="numer_zamowienia" value={dane.numer_zamowienia} onChange={zmienPole} />
          </label>
          <label>
            Data zamówienia
            <input type="date" name="data_zamowienia" value={dane.data_zamowienia} onChange={zmienPole} />
          </label>
          <label>
            Termin realizacji (tygodnie)
            <input
              type="number"
              name="termin_realizacji_tygodnie"
              value={dane.termin_realizacji_tygodnie}
              onChange={zmienPole}
            />
          </label>

          <label>
            Data dostawy
            <input type="date" name="data_dostawy" value={dane.data_dostawy} onChange={zmienPole} />
          </label>
          <label>
            Magazyn
            <input name="magazyn" value={dane.magazyn} onChange={zmienPole} />
          </label>
          <label>
            Braki w dostawie
            <input name="braki_w_dostawie" value={dane.braki_w_dostawie} onChange={zmienPole} />
          </label>

          <label className="pole-szerokie">
            Uwagi
            <textarea name="uwagi" value={dane.uwagi} onChange={zmienPole} rows={2} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Pozycje kosztorysu</legend>
        {!wybranyKosztorys && <p>Wybierz kosztorys powyżej, żeby zobaczyć i edytować jego pozycje.</p>}
        {wybranyKosztorys && (
          <>
            {statusZapisuPozycji === 'zapisywanie' && <p>Zapisywanie pozycji...</p>}
            {statusZapisuPozycji === 'zapisano' && <p>Zapisano ✓</p>}
            {statusZapisuPozycji === 'blad' && <p style={{ color: 'red' }}>Nie udało się zapisać pozycji.</p>}
            {statusZapisuPozycji !== 'zapisywanie' && pozycjeNiezapisane && (
              <p style={{ color: 'var(--danger)' }}>Masz niezapisane zmiany w pozycjach.</p>
            )}
            <p>
              <em>
                Zmiany w pozycjach (np. dobór klamek ustalony już po złożeniu zamówienia) zapisują się do
                kosztorysu — kliknij „Zapisz” przy pozycji.
              </em>
            </p>
            <PozycjeEditor
              pozycje={pozycje}
              onZmiana={setPozycje}
              onZapiszKosztorys={zapiszPozycjeKosztorysu}
              dostawcy={dostawcy}
              niezapisaneZmiany={pozycjeNiezapisane}
            />
          </>
        )}
      </fieldset>

      <fieldset>
        <legend>Podsumowanie finansowe</legend>

        <div className="siatka-pol">
          <label>
            Wartość netto (można uzupełnić później)
            <input type="number" step="0.01" name="wartosc_netto" value={dane.wartosc_netto} onChange={zmienPole} />
          </label>
          <label>
            VAT
            <select name="vat_procent" value={dane.vat_procent} onChange={zmienPole}>
              <option value={8}>8%</option>
              <option value={23}>23%</option>
              <option value={0}>0%</option>
            </select>
          </label>
          <label>
            Wartość brutto (wyliczana)
            <input value={dane.wartosc_netto === '' ? '—' : `${wartoscBrutto.toFixed(2)} zł`} disabled />
          </label>

          <label>
            Zaliczka klienta
            <input
              type="number"
              step="0.01"
              name="zaliczka_klienta"
              value={dane.zaliczka_klienta}
              onChange={zmienPole}
            />
          </label>
          <label>
            Data zaliczki
            <input type="date" name="data_zaliczki" value={dane.data_zaliczki} onChange={zmienPole} />
          </label>
          <label>
            Do dopłaty (wyliczane)
            <input value={doDoplaty === null ? '—' : `${doDoplaty.toFixed(2)} zł`} disabled />
          </label>

          <label>
            Zaliczka producenta
            <input
              type="number"
              step="0.01"
              name="zaliczka_producent"
              value={dane.zaliczka_producent}
              onChange={zmienPole}
            />
          </label>
          <label>
            Dopłata producenta
            <input
              type="number"
              step="0.01"
              name="doplata_producent"
              value={dane.doplata_producent}
              onChange={zmienPole}
            />
          </label>
          <label className="pole-checkbox">
            <input type="checkbox" name="doplacono" checked={dane.doplacono} onChange={zmienCheckbox} />
            Dopłacono
          </label>

          <label className="pole-checkbox">
            <input
              type="checkbox"
              name="dodaj_do_montazy"
              checked={dane.dodaj_do_montazy}
              onChange={zmienCheckbox}
            />
            Dodaj do Montaży
          </label>
        </div>
      </fieldset>

      <div style={{ marginTop: 16 }}>
        <button type="submit" disabled={zapisywanie}>
          {zapisywanie ? 'Zapisywanie...' : jestEdycja ? 'Zapisz zmiany' : 'Utwórz zamówienie'}
        </button>
      </div>

      {blad && <p style={{ color: 'red' }}>{blad}</p>}
    </form>
  )
}

export default ZamowienieForm
