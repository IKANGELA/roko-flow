import { useEffect, useState } from 'react'
import { aktualizujZamowienie, pobierzDostawcow, pobierzKosztorysy, utworzZamowienie } from '../api'

const PUSTY_FORMULARZ = {
  kosztorys_id: '',
  dostawca_id: '',
  status: 'Nowe',
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

function danePoczatkowe(zamowienie, wstepnyKosztorysId) {
  if (zamowienie) {
    return {
      kosztorys_id: zamowienie.kosztorys_id ?? '',
      dostawca_id: zamowienie.dostawca_id ?? '',
      status: zamowienie.status,
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

  useEffect(() => {
    pobierzKosztorysy().then(setKosztorysy)
    pobierzDostawcow().then(setDostawcy)
  }, [])

  function zmienPole(event) {
    const { name, value } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: value }))
  }

  function zmienCheckbox(event) {
    const { name, checked } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: checked }))
  }

  function zmienKosztorys(event) {
    const nowyId = event.target.value
    // Podpowiadamy VAT z wybranego kosztorysu — nadal można go ręcznie zmienić.
    const wybrany = kosztorysy.find((k) => String(k.id) === nowyId)
    setDane((poprzednie) => ({
      ...poprzednie,
      kosztorys_id: nowyId,
      vat_procent: wybrany ? wybrany.vat_procent : poprzednie.vat_procent,
    }))
  }

  const wartoscBrutto = dane.wartosc_netto === '' ? 0 : Number(dane.wartosc_netto) * (1 + Number(dane.vat_procent) / 100)

  async function wyslij(event) {
    event.preventDefault()

    setZapisywanie(true)
    setBlad(null)

    const daneDoWyslania = {
      kosztorys_id: dane.kosztorys_id === '' ? null : Number(dane.kosztorys_id),
      dostawca_id: dane.dostawca_id === '' ? null : Number(dane.dostawca_id),
      status: dane.status,
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
    <form onSubmit={wyslij}>
      <div>
        <label>
          Kosztorys (opcjonalnie — np. serwis lub inne zamówienie nie wymaga kosztorysu):{' '}
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
      </div>

      <div>
        <label>
          Dostawca (można uzupełnić później):{' '}
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
      </div>

      <div>
        <label>
          Status:{' '}
          <input name="status" value={dane.status} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <input
          name="numer_zamowienia"
          placeholder="Numer zamówienia (u dostawcy)"
          value={dane.numer_zamowienia}
          onChange={zmienPole}
        />
      </div>
      <div>
        <label>
          Data zamówienia:{' '}
          <input type="date" name="data_zamowienia" value={dane.data_zamowienia} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <label>
          Termin realizacji (tygodnie):{' '}
          <input
            type="number"
            name="termin_realizacji_tygodnie"
            value={dane.termin_realizacji_tygodnie}
            onChange={zmienPole}
          />
        </label>
      </div>
      <div>
        <textarea name="uwagi" placeholder="Uwagi" value={dane.uwagi} onChange={zmienPole} rows={2} />
      </div>

      <hr style={{ margin: '16px 0' }} />

      <div>
        <label>
          Data dostawy:{' '}
          <input type="date" name="data_dostawy" value={dane.data_dostawy} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <input name="magazyn" placeholder="Magazyn" value={dane.magazyn} onChange={zmienPole} />
      </div>
      <div>
        <input
          name="braki_w_dostawie"
          placeholder="Braki w dostawie"
          value={dane.braki_w_dostawie}
          onChange={zmienPole}
        />
      </div>

      <hr style={{ margin: '16px 0' }} />

      <div>
        <label>
          Wartość netto (można uzupełnić później):{' '}
          <input type="number" step="0.01" name="wartosc_netto" value={dane.wartosc_netto} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <label>
          VAT:{' '}
          <select name="vat_procent" value={dane.vat_procent} onChange={zmienPole}>
            <option value={8}>8%</option>
            <option value={23}>23%</option>
            <option value={0}>0%</option>
          </select>
        </label>
      </div>
      <div>
        <strong>
          Wartość brutto (wyliczana): {dane.wartosc_netto === '' ? '—' : `${wartoscBrutto.toFixed(2)} zł`}
        </strong>
      </div>
      <div>
        <label>
          Zaliczka producenta:{' '}
          <input type="number" step="0.01" name="zaliczka_producent" value={dane.zaliczka_producent} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <label>
          Dopłata producenta:{' '}
          <input type="number" step="0.01" name="doplata_producent" value={dane.doplata_producent} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <label>
          Zaliczka klienta:{' '}
          <input type="number" step="0.01" name="zaliczka_klienta" value={dane.zaliczka_klienta} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <label>
          Data zaliczki:{' '}
          <input type="date" name="data_zaliczki" value={dane.data_zaliczki} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" name="doplacono" checked={dane.doplacono} onChange={zmienCheckbox} /> Dopłacono
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" name="dodaj_do_montazy" checked={dane.dodaj_do_montazy} onChange={zmienCheckbox} />{' '}
          Dodaj do Montaży
        </label>
      </div>

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
