# ROKO Flow

Projekt powstał z konkretnej potrzeby. Firma stolarska ROKO prowadziła cały proces sprzedaży (kosztorysy, zamówienia, montaże) w Arkuszach Google, z osobnymi zakładkami połączonymi ręcznie klikanymi linkami. Działało, ale z czasem trudno było to ogarnąć: kosztorys trzeba było kopiować do zamówienia, dane klienta wpisywać po kilka razy, a każda zmiana groziła zepsuciem jakiejś formuły.

Zamiast kolejnej wersji arkusza postanowiłam zbudować to jako prawdziwą aplikację webową. Przy okazji jest to dla mnie projekt do nauki: pierwszy raz budowałam coś tej wielkości od zera, z podziałem na warstwy backendu i osobnym frontendem.

## Co robi

Ścieżka jest taka sama jak w arkuszu, tylko już bez ręcznego przepisywania. Zakładasz klienta, robisz mu kosztorys (z pozycjami typu drzwi, okna, klamki, każda pozycja ma swoje składniki kosztu, np. osobno towar, osobno montaż, osobno podfrezowanie), po akceptacji kosztorys zamienia się w zamówienie do konkretnego dostawcy, a na końcu jest montaż. Dostawcy przypisuje się do konkretnej pozycji, nie do całego zamówienia, bo w praktyce drzwi mogą być od jednego producenta, a klamki od zupełnie innego.

Kosztorys sam liczy VAT, rabat, zaliczkę i to, ile zostało do dopłaty. Te wyliczenia robiłam kilka razy od nowa, bo dopiero w trakcie rozmów z osobą, która na co dzień pracuje na tych arkuszach, wychodziły kolejne szczegóły (np. że rabat liczy się od netto, a nie od brutto).

## Z czego to zrobione

Backend: Python, FastAPI, SQLAlchemy, SQLite.
Frontend: React (Vite), bez dodatkowych bibliotek UI, style pisane ręcznie.

Backend jest rozbity na warstwy (routery, serwisy, repozytoria, modele) głównie po to, żebym mogła się nauczyć, po co w ogóle taki podział istnieje. Na przykład dane klientów najpierw trzymałam w pamięci procesu, a potem podmieniłam to na prawdziwą bazę danych i reszta kodu (logika biznesowa, endpointy) w ogóle się nie zmieniła. To był dobry moment, żeby zobaczyć, po co jest wzorzec repozytorium, a nie tylko przeczytać o nim.

## Stan projektu

Wszystkie pięć modułów (klienci, dostawcy, kosztorysy, zamówienia, montaże) działa od dodawania po usuwanie. Czego jeszcze nie ma: generowania dokumentów PDF (umowa, protokół odbioru itd., w arkuszu to osobne wydruki) i prawdziwego wdrożenia gdzieś poza moim komputerem.

## Uruchomienie

```bash
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

Frontend pod http://localhost:5173, dokumentacja API pod http://localhost:8000/docs.

## Zrzuty ekranu

_(do uzupełnienia)_
