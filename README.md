# paionline

Projekt kursowy Programowania Aplikacji Internetowych

Rok akademicki 2020/21

## zadanie 1 - zarządzanie osobami (max 4.5)

* (pracownik) _przy zakładaniu_ - dodatkowe pola na email, rolę;

* walidacja unikalności emaila i odpowiedniej wartości roli;

* generowanie hasła;

* hasło może być podejrzane przez pracownika, ale tylko wtedy gdy nie zostało zmienione przez użytkownika alternatywnie: wygenerowanie tokenu pozwalającego na załadowanie czasowo dostępnej strony do zmiany hasła użytkownika;

* _przy modyfikacji_ - walidacja emaila, roli, regeneracja hasła;

* _przy usuwaniu_ - potwierdzenie tak/nie; alternatywnie: nie usuwamy w ogóle a deaktywujemy konto; ewentualnie usuwamy ale tylko gdy nie zagraża to spójności danych (klient nie ma żadnych transakcji); (klient) możliwość zmiany hasła;

* haszowanie hasła (niewygenerowanego).

## zadanie 2 - grupowanie osób (max 4.5)

* dodatkowa kolekcja zawierająca grupy (nazwy);

* każda osoba może należeć do zero lub więcej grup; identyfikatory grup do który należy osoba mogą być przechowywane w kolekcji persons jako tablice id-ów albo dodatkowa kolekcja łączaca id osoby z id grupy;

* (pracownik) interfejs do edycji grup (uwaga: przy kasowaniu grupy, usunąć wszystkie do niej przynależności);

* w interfejsie dodawania/edycji osoby stworzyć wygodną możliwość określania przynależności do grup; propozycja - multiselect.

## zadanie 3 - filtrowanie osób (max 5)

* (pracownik) możliwość określania liczby wyświetlanych rekordów;

* przyciski "poprzednia porcja"/"następna porcja" danych; walidacja tych przycisków;

* wpisywanie frazy filtrowania powoduje wyświetlenie jedynie obiektów zawierających frazę;

* doczytywanie danych po przewinięciu skrolera na sam dół.

## zadanie 4 - przelewy do poprzednich odbiorców wg listy, do nowych wg numeru konta (max 4)

* (klient) przy przelewie: jeżeli zrobiliśmy kiedyś przelew do danej osoby, powinna być ona wybieralna z komboboxa; jeżeli nie, do zrobienia przelewu musimy użyć numeru konta (np. _id osoby)

## zadanie 5 - (wymaga zrobienia części zadania 2) (max 4.5)

* (klient) strona ze statystyką przelewów, rozbitą na grupy nadawców i odbiorców;

* możliwość określenia interesującego zakresu dat;

* możliwość określenia interesujących nas grup.

---
## komentarze

* użycie w którymkolwiek zadaniu funkcjonalności tj. websockety albo dynamiczne wykresy podnosi wartość zadania.