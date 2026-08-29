import { useEffect, useState } from 'react'
import { aktualizujMontaz, pobierzKosztorysy, utworzMontaz } from '../api'

const PUSTY_FORMULARZ = {
  kosztorys_id: '',
  data_montazu: '',
  godzina_montazu: '',
  co_do_montazu: '',
  nazwa_montazysty: '',
  status_montazu: 'Do ustalenia',
  uwagi_do_montazu: '',
  oswiadczenie_zlozone: false,
  zsynchronizowano_kalendarz: false,
}

function danePoczatkowe(montaz, wstepnyKosztorysId) {
  if (montaz) {
    return {
      kosztorys_id: montaz.kosztorys_id,
      data_montazu: montaz.data_montazu || '',
      godzina_montazu: montaz.godzina_montazu || '',
      co_do_montazu: montaz.co_do_montazu || '',
      nazwa_montazysty: montaz.nazwa_montazysty || '',
      status_montazu: montaz.status_montazu,
      uwagi_do_montazu: montaz.uwagi_do_montazu || '',
      oswiadczenie_zlozone: montaz.oswiadczenie_zlozone,
      zsynchronizowano_kalendarz: montaz.zsynchronizowano_kalendarz,
    }
  }
  if (wstepnyKosztorysId) {
    return { ...PUSTY_FORMULARZ, kosztorys_id: wstepnyKosztorysId }
  }
  return PUSTY_FORMULARZ
}

function MontazForm({ montaz, wstepnyKosztorysId, onZapisano }) {
  const jestEdycja = Boolean(montaz)

  const [kosztorysy, setKosztorysy] = useState([])
  const [dane, setDane] = useState(() => danePoczatkowe(montaz, wstepnyKosztorysId))
  const [zapisywanie, setZapisywanie] = useState(false)
  const [blad, setBlad] = useState(null)

  useEffect(() => {
    pobierzKosztorysy().then(setKosztorysy)
  }, [])

  function zmienPole(event) {
    const { name, value } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: value }))
  }

  function zmienCheckbox(event) {
    const { name, checked } = event.target
    setDane((poprzednie) => ({ ...poprzednie, [name]: checked }))
  }

  async function wyslij(event) {
    event.preventDefault()
    if (!dane.kosztorys_id) {
      setBlad('Wybierz kosztorys.')
      return
    }

    setZapisywanie(true)
    setBlad(null)

    const daneDoWyslania = {
      kosztorys_id: Number(dane.kosztorys_id),
      data_montazu: dane.data_montazu || null,
      godzina_montazu: dane.godzina_montazu || null,
      co_do_montazu: dane.co_do_montazu || null,
      nazwa_montazysty: dane.nazwa_montazysty || null,
      status_montazu: dane.status_montazu,
      uwagi_do_montazu: dane.uwagi_do_montazu || null,
      oswiadczenie_zlozone: dane.oswiadczenie_zlozone,
      zsynchronizowano_kalendarz: dane.zsynchronizowano_kalendarz,
    }

    try {
      const zapisany = jestEdycja
        ? await aktualizujMontaz(montaz.id, daneDoWyslania)
        : await utworzMontaz(daneDoWyslania)
      onZapisano(zapisany)
      if (!jestEdycja) {
        setDane(PUSTY_FORMULARZ)
      }
    } catch (e) {
      setBlad(jestEdycja ? 'Nie udało się zaktualizować montażu.' : 'Nie udało się zapisać montażu.')
    } finally {
      setZapisywanie(false)
    }
  }

  return (
    <form onSubmit={wyslij}>
      <div>
        <label>
          Kosztorys:{' '}
          <select name="kosztorys_id" value={dane.kosztorys_id} onChange={zmienPole} required>
            <option value="" disabled>
              -- wybierz kosztorys --
            </option>
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
          Data montażu:{' '}
          <input type="date" name="data_montazu" value={dane.data_montazu} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <label>
          Godzina montażu:{' '}
          <input type="time" name="godzina_montazu" value={dane.godzina_montazu} onChange={zmienPole} />
        </label>
      </div>
      <div>
        <input
          name="co_do_montazu"
          placeholder="Co do montażu (np. drzwi)"
          value={dane.co_do_montazu}
          onChange={zmienPole}
        />
      </div>
      <div>
        <input
          name="nazwa_montazysty"
          placeholder="Nazwa montażysty"
          value={dane.nazwa_montazysty}
          onChange={zmienPole}
        />
      </div>
      <div>
        <label>
          Status:{' '}
          <select name="status_montazu" value={dane.status_montazu} onChange={zmienPole}>
            <option value="Do ustalenia">Do ustalenia</option>
            <option value="Zaplanowano">Zaplanowano</option>
            <option value="Zrealizowano">Zrealizowano</option>
          </select>
        </label>
      </div>
      <div>
        <textarea
          name="uwagi_do_montazu"
          placeholder="Uwagi do montażu"
          value={dane.uwagi_do_montazu}
          onChange={zmienPole}
          rows={2}
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="oswiadczenie_zlozone"
            checked={dane.oswiadczenie_zlozone}
            onChange={zmienCheckbox}
          />{' '}
          Oświadczenie o powierzchni złożone
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="zsynchronizowano_kalendarz"
            checked={dane.zsynchronizowano_kalendarz}
            onChange={zmienCheckbox}
          />{' '}
          Zsynchronizowano z kalendarzem
        </label>
      </div>

      <div style={{ marginTop: 16 }}>
        <button type="submit" disabled={zapisywanie}>
          {zapisywanie ? 'Zapisywanie...' : jestEdycja ? 'Zapisz zmiany' : 'Utwórz montaż'}
        </button>
      </div>

      {blad && <p style={{ color: 'red' }}>{blad}</p>}
    </form>
  )
}

export default MontazForm
