// Données des phrases expérimentales
const EXPERIMENTAL_SENTENCES = [
    // Phrases originales et nouvelles mélangées
    {
        sentence: "Der Hund schläft im Garten.",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Le chien dort dans le jardin."
    },
    {
        sentence: "Die Katze trinkt Milch.",
        condition: "simple_non_ambiguous", 
        expected: "grammatical",
        translation: "Le chat boit du lait."
    },
    {
        sentence: "Das Kind spielt mit dem Ball.",
        condition: "simple_non_ambiguous",
        expected: "grammatical", 
        translation: "L'enfant joue avec la balle."
    },
    {
        sentence: "Die Frau liest ein Buch.",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "La femme lit un livre."
    },
    {
        sentence: "Der Mann arbeitet im Büro.",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "L'homme travaille au bureau."
    },
    {
        sentence: "Das Auto fährt schnell.",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "La voiture roule vite."
    },
    {
        sentence: "Die Katzen schlafen schnell.",
        condition: "simple_non_ambiguous",
        expected: "ungrammatical",
        translation: "Les chats dorment rapidement."
    },
    {
        sentence: "Der Junge spielt im Gartens.",
        condition: "simple_non_ambiguous",
        expected: "ungrammatical",
        translation: "Le garçon joue dans les jardins."
    },
    {
        sentence: "Peter trinkt Wassers.",
        condition: "simple_non_ambiguous",
        expected: "ungrammatical",
        translation: "Peter boit des eaux."
    },
    {
        sentence: "Max malt Bilder mit Freude.",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Max peint des images avec joie."
    },

    // Phrases complexes, non ambiguës
    {
        sentence: "Der Mann, der gestern gekommen ist, arbeitet hier.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "L'homme qui est venu hier travaille ici."
    },
    {
        sentence: "Das Buch, das ich gelesen habe, war interessant.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Le livre que j'ai lu était intéressant."
    },
    {
        sentence: "Die Frau, die ich gestern gesehen habe, ist meine Schwester.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "La femme que j'ai vue hier est ma sœur."
    },
    {
        sentence: "Der Hund, der im Garten spielt, ist braun.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Le chien qui joue dans le jardin est marron."
    },
    {
        sentence: "Das Auto, das ich gekauft habe, ist neu.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "La voiture que j'ai achetée est neuve."
    },
    {
        sentence: "Die Kinder, die draußen spielen, sind laut.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Les enfants qui jouent dehors sont bruyants."
    },
    {
        sentence: "Am Morgen trinkt Lisa Kaffee.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Le matin, Lisa boit du café."
    },
    {
        sentence: "Walter trinkt am Morgen Milch.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Walter boit du lait le matin."
    },
    {
        sentence: "Laura liest heute ein spannendes Buch.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Laura lit aujourd'hui un livre passionnant."
    },
    {
        sentence: "Die Kinder spielen draußen am Abend.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Les enfants jouent dehors le soir."
    },

    // Phrases ambiguës avec résolution facile
    {
        sentence: "Der Hund beißt den Mann mit dem Stock.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "Le chien mord l'homme avec le bâton."
    },
    {
        sentence: "Die Frau sieht den Mann mit dem Fernglas.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "La femme voit l'homme avec les jumelles."
    },
    {
        sentence: "Das Kind isst den Apfel mit dem Messer.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "L'enfant mange la pomme avec le couteau."
    },
    {
        sentence: "Der Lehrer schlägt den Schüler mit dem Lineal.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "Le professeur frappe l'élève avec la règle."
    },
    {
        sentence: "Die Mutter füttert das Baby mit der Flasche.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "La mère nourrit le bébé avec le biberon."
    },
    {
        sentence: "Der Gärtner gießt die Blumen mit der Gießkanne.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "Le jardinier arrose les fleurs avec l'arrosoir."
    },
    {
        sentence: "Schnell schläft die Katze.",
        condition: "ambiguous_easy",
        expected: "ungrammatical",
        translation: "Rapidement dort le chat."
    },
    {
        sentence: "Im Garten spielt der Hund laut.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "Dans le jardin joue le chien bruyamment."
    },
    {
        sentence: "Die Katze spielt schnell im Garten.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "Le chat joue rapidement dans le jardin."
    },
    {
        sentence: "Heute liest Max ein spannendes Buch.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "Aujourd'hui lit Max un livre passionnant."
    },
    {
        sentence: "Mit Freude malt Anna Bilder.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "Avec joie peint Anna des images."
    },
    {
        sentence: "Am Abend spielen die Kinder draußen.",
        condition: "ambiguous_easy",
        expected: "grammatical",
        translation: "Le soir jouent les enfants dehors."
    },

    // Phrases ambiguës avec résolution difficile
    {
        sentence: "Der Hund beißt den Mann mit dem Stock schlägt.",
        condition: "ambiguous_difficult",
        expected: "ungrammatical",
        translation: "Le chien mord l'homme avec le bâton frappe."
    },
    {
        sentence: "Die Frau sieht den Mann mit dem Fernglas beobachtet.",
        condition: "ambiguous_difficult",
        expected: "ungrammatical",
        translation: "La femme voit l'homme avec les jumelles observe."
    },
    {
        sentence: "Das Kind isst den Apfel mit dem Messer schneidet.",
        condition: "ambiguous_difficult",
        expected: "ungrammatical",
        translation: "L'enfant mange la pomme avec le couteau coupe."
    },
    {
        sentence: "Der Lehrer schlägt den Schüler mit dem Lineal bestraft.",
        condition: "ambiguous_difficult",
        expected: "ungrammatical",
        translation: "Le professeur frappe l'élève avec la règle punit."
    },
    {
        sentence: "Die Mutter füttert das Baby mit der Flasche trinkt.",
        condition: "ambiguous_difficult",
        expected: "ungrammatical",
        translation: "La mère nourrit le bébé avec le biberon boit."
    },
    {
        sentence: "Der Gärtner gießt die Blumen mit der Gießkanne bewässert.",
        condition: "ambiguous_difficult",
        expected: "ungrammatical",
        translation: "Le jardinier arrose les fleurs avec l'arrosoir irrigue."
    },
    {
        sentence: "Peter trinkt liest Wasser.",
        condition: "ambiguous_difficult",
        expected: "ungrammatical",
        translation: "Peter boit lit de l'eau."
    },
    {
        sentence: "Wir gehen Kino spielen.",
        condition: "ambiguous_difficult",
        expected: "ungrammatical",
        translation: "Nous allons cinéma jouer."
    },
    {
        sentence: "Morgen der Vater fährt nach Berlin.",
        condition: "ambiguous_difficult",
        expected: "ungrammatical",
        translation: "Demain le père va à Berlin."
    }
];

// Phrases d'entraînement
const PRACTICE_SENTENCES = [
    {
        sentence: "Der Ball ist rund.",
        expected: "grammatical",
        feedback: "Correct ! Cette phrase est grammaticale."
    },
    {
        sentence: "Die Katze schläft schnell.",
        expected: "grammatical", 
        feedback: "Correct ! Cette phrase est grammaticale."
    },
    {
        sentence: "Der Hund läuft schnell.",
        expected: "grammatical",
        feedback: "Correct ! Cette phrase est grammaticale."
    }
]; 