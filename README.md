# paionline

Projekt kursowy Programowania Aplikacji Internetowych

Rok akademicki 2020/21

## zadanie 1 - zarządzanie osobami

* (pracownik) _przy zakładaniu_ - dodatkowe pola na email, rolę;

* walidacja unikalności emaila i odpowiedniej wartości roli;

* generowanie hasła;

* hasło może być podejrzane przez pracownika, ale tylko wtedy gdy nie zostało zmienione przez użytkownika;

* _przy modyfikacji_ - walidacja emaila, roli, regeneracja hasła;

* _przy usuwaniu_ - potwierdzenie tak/nie; ewentualnie usuwamy ale tylko gdy nie zagraża to spójności danych (klient nie ma żadnych transakcji); 

* (klient) możliwość zmiany hasła;
