// Données des phrases expérimentales
const EXPERIMENTAL_SENTENCES = [
    // Catégorie 1: Verbes séparables (correctes) - simple_non_ambiguous
    {
        sentence: "sie steht jeden Tag um sechs Uhr auf",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Elle se lève tous les jours à six heures.",
        translation_pt: "Ela se levanta todos os dias às seis horas."
    },
    {
        sentence: "Sie kommen morgen an",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Ils arrivent demain.",
        translation_pt: "Eles chegam amanhã."
    },
    {
        sentence: "Mach das Licht an",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Allume la lumière.",
        translation_pt: "Acenda a luz."
    },
    {
        sentence: "Ich kann nicht einschlafen",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Je n'arrive pas à m'endormir.",
        translation_pt: "Não consigo adormecer."
    },
    {
        sentence: "Wann kommst du in Berlin an?",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Quand arrives-tu à Berlin ?",
        translation_pt: "Quando você chega em Berlim?"
    },
    {
        sentence: "Er ruft mich jeden Sonntag an",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Il m'appelle chaque dimanche.",
        translation_pt: "Ele me liga todo domingo."
    },
    {
        sentence: "Du räumst dein Zimmer auf",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Tu ranges ta chambre.",
        translation_pt: "Você arruma seu quarto."
    },
    {
        sentence: "Sie macht das Fenster auf",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Elle ouvre la fenêtre.",
        translation_pt: "Ela abre a janela."
    },

    // Catégorie 2: Verbes séparables (incorrectes) - simple_ambiguous
    {
        sentence: "Ich aufstehe jeden Tag um sieben Uhr",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Je me lève tous les jours à sept heures.",
        translation_pt: "Eu me levanto todos os dias às sete horas."
    },
    {
        sentence: "Sie ankommen morgen",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Ils arrivent demain.",
        translation_pt: "Eles chegam amanhã."
    },
    {
        sentence: "Mach an das Licht!",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Allume la lumière !",
        translation_pt: "Acenda a luz!"
    },
    {
        sentence: "Ich kann nicht schlafen ein.",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Je ne peux pas m'endormir.",
        translation_pt: "Não consigo adormecer."
    },
    {
        sentence: "Wann ankommst du in Berlin?",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Quand arrives-tu à Berlin ?",
        translation_pt: "Quando você chega em Berlim?"
    },
    {
        sentence: "Er anruft mich jeden Sonntag",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Il m'appelle chaque dimanche.",
        translation_pt: "Ele me liga todo domingo."
    },
    {
        sentence: "du aufräumst dein Zimmer.",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Tu ranges ta chambre.",
        translation_pt: "Você arruma seu quarto."
    },
    {
        sentence: "Sie aufmacht das Fenster",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Elle ouvre la fenêtre.",
        translation_pt: "Ela abre a janela."
    },

    // Catégorie 3: Place du verbe (correctes) - complex_non_ambiguous
    {
        sentence: "Er schläft, da er müde ist.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Il dort car il est fatigué.",
        translation_pt: "Ele dorme porque está cansado."
    },
    {
        sentence: "Sie lachen, denn sie sind glücklich",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Ils rient car ils sont heureux.",
        translation_pt: "Eles riem porque estão felizes."
    },
    {
        sentence: "Er trinkt, weil er Durst hat",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Il boit car il a soif.",
        translation_pt: "Ele bebe porque está com sede."
    },
    {
        sentence: "Ich gehe raus, obwohl das Wetter schlecht ist.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Je sors bien que le temps soit mauvais.",
        translation_pt: "Eu saio embora o tempo esteja ruim."
    },
    {
        sentence: "Ich erkläre es, damit er es versteht",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Je l'explique pour qu'il le comprenne.",
        translation_pt: "Eu explico para que ele entenda."
    },
    {
        sentence: "Ich verstehe, dass du mitkommen willst",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Je comprends que tu veux venir.",
        translation_pt: "Eu entendo que você quer vir."
    },
    {
        sentence: "Wir wissen nicht, ob er bei der Prüfung betrogen hat.",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Nous ne savons pas s'il a triché à l'examen.",
        translation_pt: "Nós não sabemos se ele colou na prova."
    },
    {
        sentence: "Ihr seid eingeladen, wenn Ihr Zeit habt",
        condition: "complex_non_ambiguous",
        expected: "grammatical",
        translation: "Vous êtes invités si vous avez le temps.",
        translation_pt: "Vocês estão convidados se tiverem tempo."
    },

    // Catégorie 4: Place du verbe (incorrectes) - complex_ambiguous
    {
        sentence: "Er bleibt zu Hause, während seine arbeitet Frau",
        condition: "complex_ambiguous",
        expected: "ungrammatical",
        translation: "Il reste à la maison pendant que sa femme travaille.",
        translation_pt: "Ele fica em casa enquanto sua esposa trabalha."
    },
    {
        sentence: "Wir fahren in Urlaub, nachdem wir haben gespart",
        condition: "complex_ambiguous",
        expected: "ungrammatical",
        translation: "Nous partons en vacances après avoir économisé.",
        translation_pt: "Nós viajamos de férias depois de ter economizado."
    },
    {
        sentence: "Er kauft Blumen, bevor er geht nach Hause",
        condition: "complex_ambiguous",
        expected: "ungrammatical",
        translation: "Il achète des fleurs avant d'aller à la maison.",
        translation_pt: "Ele compra flores antes de ir para casa."
    },
    {
        sentence: "Ich rufe dich an, sobald ich habe Zeit",
        condition: "complex_ambiguous",
        expected: "ungrammatical",
        translation: "Je t'appelle dès que j'ai le temps.",
        translation_pt: "Eu te ligo assim que tenho tempo."
    },
    {
        sentence: "Sie lernt Deutsch, seit sie wohnt in Berlin",
        condition: "complex_ambiguous",
        expected: "ungrammatical",
        translation: "Elle apprend l'allemand depuis qu'elle vit à Berlin.",
        translation_pt: "Ela aprende alemão desde que mora em Berlim."
    },
    {
        sentence: "Wir bleiben drinnen, falls es regnet heute",
        condition: "complex_non_ambiguous",
        expected: "ungrammatical",
        translation: "Nous restons à l'intérieur au cas où il pleuvrait aujourd'hui.",
        translation_pt: "Nós ficamos dentro caso chova hoje."
    },
    {
        sentence: "Er ist müde, weil er hat spät ins Bett gegangen",
        condition: "complex_ambiguous",
        expected: "ungrammatical",
        translation: "Il est fatigué car il s'est couché tard.",
        translation_pt: "Ele está cansado porque foi dormir tarde."
    },
    {
        sentence: "Sie kommt nicht, da sie ist sehr krank",
        condition: "complex_ambiguous",
        expected: "ungrammatical",
        translation: "Elle ne vient pas car elle est très malade.",
        translation_pt: "Ela não vem porque está muito doente."
    },

    // Catégorie 5: Topicalisation (correctes)
    {
        sentence: "Die Großmutter hat die Schokolade gegessen",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "La grand-mère a mangé le chocolat.",
        translation_pt: "A avó comeu o chocolate."
    },
    {
        sentence: "Den Kater jagt der Hund",
        condition: "simple_ambiguous",
        expected: "grammatical",
        translation: "Le chien poursuit le chat.",
        translation_pt: "O cachorro persegue o gato."
    },
    {
        sentence: "Den Ball jagt der Hund im Garten",
        condition: "simple_ambiguous",
        expected: "grammatical",
        translation: "Le chien poursuit le ballon dans le jardin.",
        translation_pt: "O cachorro persegue a bola no jardim."
    },
    {
        sentence: "Den Alien erschreckt das Kind",
        condition: "simple_ambiguous",
        expected: "grammatical",
        translation: "L'enfant fait peur à l'extraterrestre.",
        translation_pt: "A criança assusta o alienígena."
    },
    {
        sentence: "Der Spielerin gibt das Kind den Ball",
        condition: "simple_ambiguous",
        expected: "grammatical",
        translation: "L'enfant donne le ballon à la joueuse.",
        translation_pt: "A criança dá a bola para a jogadora."
    },
    {
        sentence: "Mit viel Freude hat die Großmutter die Schokolade gegessen",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "La grand-mère a mangé le chocolat avec beaucoup de joie.",
        translation_pt: "A avó comeu o chocolate com muito prazer."
    },
    {
        sentence: "Im Park spielen die Kinder Fußball",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Les enfants jouent au football dans le parc.",
        translation_pt: "As crianças jogam futebol no parque."
    },
    {
        sentence: "Langsam fährt das Auto die Straße entlang",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "La voiture roule lentement le long de la route.",
        translation_pt: "O carro dirige devagar ao longo da estrada."
    },

    // Catégorie 6: Pronoms au datif et à l'accusatif (correctes) - simple_non_ambiguous
    {
        sentence: "Ich gebe ihm das Buch",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Je lui donne le livre.",
        translation_pt: "Eu dou o livro para ele."
    },
    {
        sentence: "Ich höre euch",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Je vous entends.",
        translation_pt: "Eu os escuto."
    },
    {
        sentence: "Sie liebt ihn",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Elle l'aime.",
        translation_pt: "Ela o ama."
    },
    {
        sentence: "Ich schenke dir eine Blume",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Je t'offre une fleur.",
        translation_pt: "Eu te dou uma flor."
    },
    {
        sentence: "Er bringt ihnen die Zeitung",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Il leur apporte le journal.",
        translation_pt: "Ele lhes traz o jornal."
    },
    {
        sentence: "Sie zeigt mir den Weg",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Elle me montre le chemin.",
        translation_pt: "Ela me mostra o caminho."
    },
    {
        sentence: "Er sieht mich",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Il me voit.",
        translation_pt: "Ele me vê."
    },
    {
        sentence: "Wir geben ihr die Schlüssel",
        condition: "simple_non_ambiguous",
        expected: "grammatical",
        translation: "Nous lui donnons les clés.",
        translation_pt: "Nós lhe damos as chaves."
    },

    // Catégorie 7: Pronoms au datif et à l'accusatif (incorrectes) - simple_ambiguous
    {
        sentence: "Ich gebe er das Buch",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Je lui donne le livre.",
        translation_pt: "Eu dou o livro para ele."
    },
    {
        sentence: "Ich höre dir",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Je t'entends.",
        translation_pt: "Eu te escuto."
    },
    {
        sentence: "Sie liebt er",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Elle l'aime.",
        translation_pt: "Ela o ama."
    },
    {
        sentence: "Ich schenke dich eine Blume",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Je t'offre une fleur.",
        translation_pt: "Eu te dou uma flor."
    },
    {
        sentence: "Er bringt sie die Zeitung",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Il leur apporte le journal.",
        translation_pt: "Ele lhes traz o jornal."
    },
    {
        sentence: "Sie zeigt mich den Weg",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Elle me montre le chemin.",
        translation_pt: "Ela me mostra o caminho."
    },
    {
        sentence: "Er sieht mir",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Il me voit.",
        translation_pt: "Ele me vê."
    },
    {
        sentence: "Wir geben sie die Schlüssel",
        condition: "simple_ambiguous",
        expected: "ungrammatical",
        translation: "Nous lui donnons les clés.",
        translation_pt: "Nós lhe damos as chaves."
    }
];

// Phrases d'entraînement
const PRACTICE_SENTENCES = [

    {
        sentence: "Die Katze sitzt auf dem Stuhl.",
        expected: "grammatical",
        feedback: "Correct ! Cette phrase est grammaticale."
    },
    {
        sentence: "Der Hund läuft schnell.",
        expected: "grammatical",
        feedback: "Correct ! Cette phrase est grammaticale."
    },
    {
        sentence: "Ich habe gestern angerufen meinen Freund.",
        expected: "ungrammatical",
        feedback: "Incorrect. La réponse attendue était : Non grammaticale."
    },
    {
        sentence: "Der Ball ist rund.",
        expected: "grammatical",
        feedback: "Correct ! Cette phrase est grammaticale."
    },
    {
        sentence: "Er spielt den Ball mit.",
        expected: "ungrammatical",
        feedback: "Incorrect. La réponse attendue était : Non grammaticale."
    }
]; 
