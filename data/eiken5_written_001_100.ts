export type WrittenQuestion = {
  id: string;
  level: "英検5級" | "英検4級" | "英検3級" | "英検準2級";
  category: "vocabulary" | "grammar" | "phrase" | "conversation" | "writing";
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  japanese: string;
};

export const eiken5Written001_100: WrittenQuestion[] = [
  {
    id: "eiken5-written-001",
    level: "英検5級",
    category: "grammar",
    question: "I ___ a student.",
    choices: ["am", "is", "are", "be"],
    answerIndex: 0,
    explanation: "主語が I のときは am を使います。",
    japanese: "私は学生です。"
  },
  {
    id: "eiken5-written-002",
    level: "英検5級",
    category: "vocabulary",
    question: "This is a ___. It can fly.",
    choices: ["dog", "cat", "bird", "fish"],
    answerIndex: 2,
    explanation: "fly「飛ぶ」ことができるのは bird「鳥」です。",
    japanese: "これは鳥です。飛ぶことができます。"
  },
  {
    id: "eiken5-written-003",
    level: "英検5級",
    category: "conversation",
    question: "A: Hello! How are you? B: ___",
    choices: ["I am fine, thank you.", "It is a cat.", "This is my pen.", "She is tall."],
    answerIndex: 0,
    explanation: "How are you? には I am fine, thank you. と答えます。",
    japanese: "A: こんにちは！元気ですか。B: 元気です、ありがとう。"
  },
  {
    id: "eiken5-written-004",
    level: "英検5級",
    category: "grammar",
    question: "She ___ my sister.",
    choices: ["am", "is", "are", "be"],
    answerIndex: 1,
    explanation: "主語が She のときは is を使います。",
    japanese: "彼女は私の姉です。"
  },
  {
    id: "eiken5-written-005",
    level: "英検5級",
    category: "vocabulary",
    question: "I drink ___ every morning.",
    choices: ["milk", "book", "chair", "tree"],
    answerIndex: 0,
    explanation: "drink「飲む」に合うのは milk「牛乳」です。",
    japanese: "私は毎朝牛乳を飲みます。"
  },
  {
    id: "eiken5-written-006",
    level: "英検5級",
    category: "phrase",
    question: "___ you. You helped me.",
    choices: ["Thank", "Sorry", "Hello", "Good"],
    answerIndex: 0,
    explanation: "Thank you. は「ありがとう」という意味です。",
    japanese: "ありがとう。助けてくれました。"
  },
  {
    id: "eiken5-written-007",
    level: "英検5級",
    category: "grammar",
    question: "We ___ students.",
    choices: ["am", "is", "are", "be"],
    answerIndex: 2,
    explanation: "主語が We のときは are を使います。",
    japanese: "私たちは学生です。"
  },
  {
    id: "eiken5-written-008",
    level: "英検5級",
    category: "vocabulary",
    question: "This color is ___. It is the color of the sky.",
    choices: ["red", "blue", "green", "yellow"],
    answerIndex: 1,
    explanation: "空の色は blue「青」です。",
    japanese: "この色は青です。空の色です。"
  },
  {
    id: "eiken5-written-009",
    level: "英検5級",
    category: "conversation",
    question: "A: What is this? B: ___",
    choices: ["It is a bag.", "I am Ken.", "She is nice.", "We go home."],
    answerIndex: 0,
    explanation: "What is this? には It is a ... と答えます。",
    japanese: "A: これは何ですか。B: かばんです。"
  },
  {
    id: "eiken5-written-010",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct sentence.",
    choices: ["I am happy.", "I happy am.", "Am I happy.", "Happy I am."],
    answerIndex: 0,
    explanation: "英語の文は 主語 + be動詞 + 補語 の順です。",
    japanese: "正しい文を選びなさい。私は幸せです。"
  },
  {
    id: "eiken5-written-011",
    level: "英検5級",
    category: "grammar",
    question: "___ you a teacher?",
    choices: ["Am", "Is", "Are", "Be"],
    answerIndex: 2,
    explanation: "you が主語の疑問文は Are you ...? です。",
    japanese: "あなたは先生ですか。"
  },
  {
    id: "eiken5-written-012",
    level: "英検5級",
    category: "vocabulary",
    question: "I eat ___ for breakfast.",
    choices: ["bread", "pencil", "desk", "window"],
    answerIndex: 0,
    explanation: "eat「食べる」に合うのは bread「パン」です。",
    japanese: "私は朝食にパンを食べます。"
  },
  {
    id: "eiken5-written-013",
    level: "英検5級",
    category: "phrase",
    question: "___ morning!",
    choices: ["Good", "Well", "Fine", "Nice"],
    answerIndex: 0,
    explanation: "Good morning! は「おはようございます」という挨拶です。",
    japanese: "おはようございます！"
  },
  {
    id: "eiken5-written-014",
    level: "英検5級",
    category: "grammar",
    question: "I ___ a dog. His name is Koro.",
    choices: ["have", "has", "am", "is"],
    answerIndex: 0,
    explanation: "主語が I のときは have を使います。",
    japanese: "私は犬を飼っています。名前はコロです。"
  },
  {
    id: "eiken5-written-015",
    level: "英検5級",
    category: "vocabulary",
    question: "My ___ is tall. He works in a hospital.",
    choices: ["father", "apple", "desk", "color"],
    answerIndex: 0,
    explanation: "病院で働く人物として father「父」が合います。",
    japanese: "私の父は背が高いです。病院で働いています。"
  },
  {
    id: "eiken5-written-016",
    level: "英検5級",
    category: "conversation",
    question: "A: How old are you? B: ___",
    choices: ["I am twelve.", "It is Tuesday.", "I like cats.", "She is kind."],
    answerIndex: 0,
    explanation: "How old are you? には年齢を答えます。",
    japanese: "A: あなたは何歳ですか。B: 12歳です。"
  },
  {
    id: "eiken5-written-017",
    level: "英検5級",
    category: "grammar",
    question: "She ___ a cat. Its name is Mimi.",
    choices: ["have", "has", "am", "are"],
    answerIndex: 1,
    explanation: "主語が She のときは has を使います。",
    japanese: "彼女は猫を飼っています。名前はミミです。"
  },
  {
    id: "eiken5-written-018",
    level: "英検5級",
    category: "vocabulary",
    question: "I play ___ with my friends after school.",
    choices: ["soccer", "water", "cloud", "door"],
    answerIndex: 0,
    explanation: "play の後に来るスポーツとして soccer「サッカー」が合います。",
    japanese: "私は放課後、友達とサッカーをします。"
  },
  {
    id: "eiken5-written-019",
    level: "英検5級",
    category: "phrase",
    question: "___ you. I will remember your help.",
    choices: ["Thank", "Please", "Sorry", "Excuse"],
    answerIndex: 0,
    explanation: "Thank you. は感謝を伝える表現です。",
    japanese: "ありがとう。あなたの助けを忘れません。"
  },
  {
    id: "eiken5-written-020",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct word: I ___ to school every day.",
    choices: ["go", "goes", "going", "went"],
    answerIndex: 0,
    explanation: "主語が I のときは動詞の原形 go を使います。",
    japanese: "正しい単語を選びなさい。私は毎日学校へ行きます。"
  },
  {
    id: "eiken5-written-021",
    level: "英検5級",
    category: "grammar",
    question: "Do you like ___?",
    choices: ["apples", "happy", "big", "fast"],
    answerIndex: 0,
    explanation: "like の後には名詞がきます。",
    japanese: "あなたはリンゴが好きですか。"
  },
  {
    id: "eiken5-written-022",
    level: "英検5級",
    category: "vocabulary",
    question: "Today is ___. Tomorrow is Saturday.",
    choices: ["Friday", "Sunday", "Monday", "Tuesday"],
    answerIndex: 0,
    explanation: "土曜日（Saturday）の前の日は Friday「金曜日」です。",
    japanese: "今日は金曜日です。明日は土曜日です。"
  },
  {
    id: "eiken5-written-023",
    level: "英検5級",
    category: "conversation",
    question: "A: Where is your school? B: ___",
    choices: ["It is near the park.", "I am ten.", "She is my friend.", "We eat lunch."],
    answerIndex: 0,
    explanation: "Where is ...? には場所を答えます。",
    japanese: "A: あなたの学校はどこですか。B: 公園の近くです。"
  },
  {
    id: "eiken5-written-024",
    level: "英検5級",
    category: "grammar",
    question: "I ___ TV after dinner.",
    choices: ["watch", "watching", "watches", "watched"],
    answerIndex: 0,
    explanation: "主語が I のときは動詞の原形 watch を使います。",
    japanese: "私は夕食後にテレビを見ます。"
  },
  {
    id: "eiken5-written-025",
    level: "英検5級",
    category: "vocabulary",
    question: "My ___ is 100 meters long.",
    choices: ["school", "apple", "drink", "happy"],
    answerIndex: 0,
    explanation: "100メートルの長さを持つ場所として school「学校」が合います。",
    japanese: "私の学校は100メートルあります。"
  },
  {
    id: "eiken5-written-026",
    level: "英検5級",
    category: "phrase",
    question: "Excuse ___, where is the station?",
    choices: ["me", "my", "I", "mine"],
    answerIndex: 0,
    explanation: "Excuse me は「すみません」と話しかける表現です。",
    japanese: "すみません、駅はどこですか。"
  },
  {
    id: "eiken5-written-027",
    level: "英検5級",
    category: "grammar",
    question: "He ___ not like vegetables.",
    choices: ["do", "does", "is", "are"],
    answerIndex: 1,
    explanation: "主語が He のときは does not を使います。",
    japanese: "彼は野菜が好きではありません。"
  },
  {
    id: "eiken5-written-028",
    level: "英検5級",
    category: "vocabulary",
    question: "I use a ___ to write letters.",
    choices: ["pen", "bed", "cat", "ball"],
    answerIndex: 0,
    explanation: "write「書く」のに使うのは pen「ペン」です。",
    japanese: "私は手紙を書くのにペンを使います。"
  },
  {
    id: "eiken5-written-029",
    level: "英検5級",
    category: "conversation",
    question: "A: Do you like music? B: ___",
    choices: ["Yes, I do.", "It is red.", "She is nice.", "At school."],
    answerIndex: 0,
    explanation: "Do you like ...? には Yes, I do. か No, I don't. と答えます。",
    japanese: "A: あなたは音楽が好きですか。B: はい、好きです。"
  },
  {
    id: "eiken5-written-030",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct sentence.",
    choices: ["She has a big house.", "She have a big house.", "She is a big house.", "She big house has."],
    answerIndex: 0,
    explanation: "She + has + 目的語 の順で正しい文を作ります。",
    japanese: "正しい文を選びなさい。彼女は大きな家を持っています。"
  },
  {
    id: "eiken5-written-031",
    level: "英検5級",
    category: "grammar",
    question: "___ is your name?",
    choices: ["What", "Where", "When", "Who"],
    answerIndex: 0,
    explanation: "名前を聞くときは What is your name? と言います。",
    japanese: "あなたの名前は何ですか。"
  },
  {
    id: "eiken5-written-032",
    level: "英検5級",
    category: "vocabulary",
    question: "I wear a ___ when it is cold.",
    choices: ["coat", "book", "cup", "game"],
    answerIndex: 0,
    explanation: "wear「着る」に合う名詞は coat「コート」です。",
    japanese: "私は寒いときコートを着ます。"
  },
  {
    id: "eiken5-written-033",
    level: "英検5級",
    category: "phrase",
    question: "Good ___! See you tomorrow.",
    choices: ["night", "morning", "old", "fast"],
    answerIndex: 0,
    explanation: "Good night! は「おやすみなさい」という意味です。",
    japanese: "おやすみなさい！また明日。"
  },
  {
    id: "eiken5-written-034",
    level: "英検5級",
    category: "grammar",
    question: "I ___ hungry now.",
    choices: ["am", "is", "are", "do"],
    answerIndex: 0,
    explanation: "主語 I には am を使います。",
    japanese: "私は今おなかがすいています。"
  },
  {
    id: "eiken5-written-035",
    level: "英検5級",
    category: "vocabulary",
    question: "There are three ___ on the table.",
    choices: ["cups", "tall", "fast", "run"],
    answerIndex: 0,
    explanation: "three の後には名詞の複数形がきます。cups「カップ」が合います。",
    japanese: "テーブルの上にカップが3つあります。"
  },
  {
    id: "eiken5-written-036",
    level: "英検5級",
    category: "conversation",
    question: "A: What color is your bag? B: ___",
    choices: ["It is yellow.", "I am hungry.", "She likes cats.", "Two books."],
    answerIndex: 0,
    explanation: "What color ...? には色を答えます。",
    japanese: "A: あなたのかばんは何色ですか。B: 黄色です。"
  },
  {
    id: "eiken5-written-037",
    level: "英検5級",
    category: "grammar",
    question: "My father ___ in the morning.",
    choices: ["run", "runs", "running", "ran"],
    answerIndex: 1,
    explanation: "主語が My father（三人称単数）のときは runs を使います。",
    japanese: "私の父は朝に走ります。"
  },
  {
    id: "eiken5-written-038",
    level: "英検5級",
    category: "vocabulary",
    question: "I read ___ before going to bed.",
    choices: ["books", "fast", "cold", "chair"],
    answerIndex: 0,
    explanation: "read「読む」に合うのは books「本」です。",
    japanese: "私は寝る前に本を読みます。"
  },
  {
    id: "eiken5-written-039",
    level: "英検5級",
    category: "phrase",
    question: "___ me. I made a mistake.",
    choices: ["Sorry", "Thank", "Hello", "Good"],
    answerIndex: 0,
    explanation: "Sorry はすまなさを伝える表現です。",
    japanese: "すみません。間違えました。"
  },
  {
    id: "eiken5-written-040",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct word: My mother ___ cookies every Sunday.",
    choices: ["makes", "make", "making", "made"],
    answerIndex: 0,
    explanation: "主語が My mother（三人称単数）のときは makes を使います。",
    japanese: "正しい単語を選びなさい。私の母は毎週日曜日にクッキーを作ります。"
  },
  {
    id: "eiken5-written-041",
    level: "英検5級",
    category: "grammar",
    question: "___ is the cat? It is under the table.",
    choices: ["Where", "What", "Who", "When"],
    answerIndex: 0,
    explanation: "場所をたずねるときは Where を使います。",
    japanese: "猫はどこですか。テーブルの下です。"
  },
  {
    id: "eiken5-written-042",
    level: "英検5級",
    category: "vocabulary",
    question: "I am ___. I need some water.",
    choices: ["thirsty", "heavy", "long", "round"],
    answerIndex: 0,
    explanation: "水が必要なときは thirsty「のどが渇いた」と言います。",
    japanese: "私はのどが渇いています。水が必要です。"
  },
  {
    id: "eiken5-written-043",
    level: "英検5級",
    category: "conversation",
    question: "A: Is this your eraser? B: ___",
    choices: ["Yes, it is.", "I am fine.", "She is tall.", "In the bag."],
    answerIndex: 0,
    explanation: "Is this ...? には Yes, it is. か No, it isn't. と答えます。",
    japanese: "A: これはあなたの消しゴムですか。B: はい、そうです。"
  },
  {
    id: "eiken5-written-044",
    level: "英検5級",
    category: "grammar",
    question: "I ___ my hands before lunch.",
    choices: ["wash", "washes", "washing", "washed"],
    answerIndex: 0,
    explanation: "主語 I には動詞の原形 wash を使います。",
    japanese: "私は昼食の前に手を洗います。"
  },
  {
    id: "eiken5-written-045",
    level: "英検5級",
    category: "vocabulary",
    question: "My ___ is tall and has black hair.",
    choices: ["brother", "book", "pen", "school"],
    answerIndex: 0,
    explanation: "人物を表す言葉は brother「兄・弟」です。",
    japanese: "私の兄は背が高く、黒い髪をしています。"
  },
  {
    id: "eiken5-written-046",
    level: "英検5級",
    category: "phrase",
    question: "___ me, please. I am calling the station.",
    choices: ["Hold", "Go", "Come", "Tell"],
    answerIndex: 0,
    explanation: "Hold on は電話で「少々お待ちください」という表現です。",
    japanese: "少々お待ちください。駅に電話しています。"
  },
  {
    id: "eiken5-written-047",
    level: "英検5級",
    category: "grammar",
    question: "I like ___. I have three.",
    choices: ["cats", "happy", "big", "fast"],
    answerIndex: 0,
    explanation: "like の後には名詞がきます。",
    japanese: "私は猫が好きです。3匹飼っています。"
  },
  {
    id: "eiken5-written-048",
    level: "英検5級",
    category: "vocabulary",
    question: "The apple is ___. It is not yellow.",
    choices: ["red", "water", "sleep", "under"],
    answerIndex: 0,
    explanation: "リンゴの色として red「赤」が合います。",
    japanese: "そのリンゴは赤いです。黄色ではありません。"
  },
  {
    id: "eiken5-written-049",
    level: "英検5級",
    category: "conversation",
    question: "A: Can you run fast? B: ___",
    choices: ["Yes, I can.", "It is a ball.", "She is kind.", "At home."],
    answerIndex: 0,
    explanation: "Can you ...? には Yes, I can. か No, I can't. と答えます。",
    japanese: "A: あなたは速く走れますか。B: はい、できます。"
  },
  {
    id: "eiken5-written-050",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct sentence.",
    choices: ["There is a dog in the garden.", "There are a dog in the garden.", "Is there dog in the garden.", "A dog there is in garden."],
    answerIndex: 0,
    explanation: "単数のものには There is を使います。",
    japanese: "正しい文を選びなさい。庭に犬が1匹います。"
  },
  {
    id: "eiken5-written-051",
    level: "英検5級",
    category: "grammar",
    question: "I ___ to the park on Sunday.",
    choices: ["go", "goes", "am", "is"],
    answerIndex: 0,
    explanation: "主語 I には動詞の原形 go を使います。",
    japanese: "私は日曜日に公園へ行きます。"
  },
  {
    id: "eiken5-written-052",
    level: "英検5級",
    category: "vocabulary",
    question: "My birthday is in ___.",
    choices: ["April", "school", "happy", "tall"],
    answerIndex: 0,
    explanation: "in の後に月名がきます。April「4月」が正しい名詞です。",
    japanese: "私の誕生日は4月です。"
  },
  {
    id: "eiken5-written-053",
    level: "英検5級",
    category: "phrase",
    question: "Nice to ___ you.",
    choices: ["meet", "eat", "read", "make"],
    answerIndex: 0,
    explanation: "Nice to meet you. は初めて会う人への挨拶です。",
    japanese: "はじめまして。"
  },
  {
    id: "eiken5-written-054",
    level: "英検5級",
    category: "grammar",
    question: "I have ___ pencil.",
    choices: ["a", "an", "the", "is"],
    answerIndex: 0,
    explanation: "子音で始まる名詞の前には a を使います。",
    japanese: "私は鉛筆を1本持っています。"
  },
  {
    id: "eiken5-written-055",
    level: "英検5級",
    category: "vocabulary",
    question: "I am ___. I need to sleep.",
    choices: ["tired", "long", "round", "cold"],
    answerIndex: 0,
    explanation: "sleep「眠る」が必要なときは tired「疲れた」と言います。",
    japanese: "私は疲れています。眠る必要があります。"
  },
  {
    id: "eiken5-written-056",
    level: "英検5級",
    category: "conversation",
    question: "A: What day is today? B: ___",
    choices: ["It is Monday.", "I am fine.", "She has a cat.", "It is red."],
    answerIndex: 0,
    explanation: "What day is today? には曜日を答えます。",
    japanese: "A: 今日は何曜日ですか。B: 月曜日です。"
  },
  {
    id: "eiken5-written-057",
    level: "英検5級",
    category: "grammar",
    question: "I have ___ umbrella.",
    choices: ["an", "a", "the", "is"],
    answerIndex: 0,
    explanation: "母音で始まる名詞の前には an を使います。umbrella は u で始まります。",
    japanese: "私は傘を1本持っています。"
  },
  {
    id: "eiken5-written-058",
    level: "英検5級",
    category: "vocabulary",
    question: "I ___ the piano. I practice every day.",
    choices: ["play", "eat", "wear", "drink"],
    answerIndex: 0,
    explanation: "楽器には play「弾く」を使います。",
    japanese: "私はピアノを弾きます。毎日練習します。"
  },
  {
    id: "eiken5-written-059",
    level: "英検5級",
    category: "phrase",
    question: "___ afternoon!",
    choices: ["Good", "Well", "Fine", "Nice"],
    answerIndex: 0,
    explanation: "Good afternoon! は「こんにちは」という午後の挨拶です。",
    japanese: "こんにちは！"
  },
  {
    id: "eiken5-written-060",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct word: I ___ a book in the library.",
    choices: ["read", "reads", "reading", "to read"],
    answerIndex: 0,
    explanation: "主語 I には動詞の原形 read を使います。",
    japanese: "正しい単語を選びなさい。私は図書館で本を読みます。"
  },
  {
    id: "eiken5-written-061",
    level: "英検5級",
    category: "grammar",
    question: "Is he your ___?",
    choices: ["brother", "happy", "run", "fast"],
    answerIndex: 0,
    explanation: "be 動詞の後には名詞や形容詞がきます。brother「兄・弟」が正しい名詞です。",
    japanese: "彼はあなたのお兄さんですか。"
  },
  {
    id: "eiken5-written-062",
    level: "英検5級",
    category: "vocabulary",
    question: "The ___ is shining. It is a sunny day.",
    choices: ["sun", "rain", "wind", "snow"],
    answerIndex: 0,
    explanation: "shine「輝く」のは sun「太陽」です。",
    japanese: "太陽が輝いています。晴れた日です。"
  },
  {
    id: "eiken5-written-063",
    level: "英検5級",
    category: "conversation",
    question: "A: Do you have a pet? B: ___",
    choices: ["Yes, I have a dog.", "It is sunny.", "She is kind.", "In the park."],
    answerIndex: 0,
    explanation: "Do you have ...? には Yes, I have ... か No, I don't. と答えます。",
    japanese: "A: ペットはいますか。B: はい、犬を飼っています。"
  },
  {
    id: "eiken5-written-064",
    level: "英検5級",
    category: "grammar",
    question: "I ___ not like spicy food.",
    choices: ["do", "does", "am", "is"],
    answerIndex: 0,
    explanation: "主語 I の否定文は do not を使います。",
    japanese: "私は辛い食べ物が好きではありません。"
  },
  {
    id: "eiken5-written-065",
    level: "英検5級",
    category: "vocabulary",
    question: "I use a ___ to draw pictures.",
    choices: ["pencil", "bed", "door", "window"],
    answerIndex: 0,
    explanation: "draw「描く」のに使うのは pencil「鉛筆」です。",
    japanese: "私は絵を描くのに鉛筆を使います。"
  },
  {
    id: "eiken5-written-066",
    level: "英検5級",
    category: "phrase",
    question: "You're ___. I made the cake for you.",
    choices: ["welcome", "sorry", "tired", "happy"],
    answerIndex: 0,
    explanation: "You're welcome. は「どういたしまして」という表現です。",
    japanese: "どういたしまして。あなたのためにケーキを作りました。"
  },
  {
    id: "eiken5-written-067",
    level: "英検5級",
    category: "grammar",
    question: "This is ___ orange.",
    choices: ["an", "a", "the", "it"],
    answerIndex: 0,
    explanation: "orange は母音 o で始まるので an を使います。",
    japanese: "これはオレンジです。"
  },
  {
    id: "eiken5-written-068",
    level: "英検5級",
    category: "vocabulary",
    question: "My ___ teaches math. She is very kind.",
    choices: ["teacher", "ball", "book", "chair"],
    answerIndex: 0,
    explanation: "teach「教える」人は teacher「先生」です。",
    japanese: "私の先生は数学を教えます。とても親切です。"
  },
  {
    id: "eiken5-written-069",
    level: "英検5級",
    category: "conversation",
    question: "A: What time is it? B: ___",
    choices: ["It is three o'clock.", "I am ten.", "She is kind.", "At school."],
    answerIndex: 0,
    explanation: "What time is it? には時刻を答えます。",
    japanese: "A: 何時ですか。B: 3時です。"
  },
  {
    id: "eiken5-written-070",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct sentence.",
    choices: ["I like summer very much.", "I like very much summer.", "Very much I like summer.", "Summer I very much like."],
    answerIndex: 0,
    explanation: "主語 + 動詞 + 目的語 + 副詞句 の語順が正しいです。",
    japanese: "正しい文を選びなさい。私は夏がとても好きです。"
  },
  {
    id: "eiken5-written-071",
    level: "英検5級",
    category: "grammar",
    question: "She ___ English and math.",
    choices: ["studies", "study", "studying", "studied"],
    answerIndex: 0,
    explanation: "三人称単数の She には studies を使います。",
    japanese: "彼女は英語と数学を勉強します。"
  },
  {
    id: "eiken5-written-072",
    level: "英検5級",
    category: "vocabulary",
    question: "I am ___. I want to eat something.",
    choices: ["hungry", "fast", "old", "long"],
    answerIndex: 0,
    explanation: "食べたいときは hungry「おなかがすいた」と言います。",
    japanese: "私はおなかがすいています。何か食べたいです。"
  },
  {
    id: "eiken5-written-073",
    level: "英検5級",
    category: "phrase",
    question: "Please ___ down.",
    choices: ["sit", "eat", "sleep", "run"],
    answerIndex: 0,
    explanation: "Please sit down. は「座ってください」という表現です。",
    japanese: "座ってください。"
  },
  {
    id: "eiken5-written-074",
    level: "英検5級",
    category: "grammar",
    question: "My ___ are in the bag.",
    choices: ["books", "fast", "red", "big"],
    answerIndex: 0,
    explanation: "are に合う複数名詞は books「本」です。",
    japanese: "私の本はかばんの中にあります。"
  },
  {
    id: "eiken5-written-075",
    level: "英検5級",
    category: "vocabulary",
    question: "I live in a ___ with my family.",
    choices: ["house", "happy", "fast", "read"],
    answerIndex: 0,
    explanation: "live in ... の後には場所の名詞がきます。house「家」が合います。",
    japanese: "私は家族と家に住んでいます。"
  },
  {
    id: "eiken5-written-076",
    level: "英検5級",
    category: "conversation",
    question: "A: Is your mother at home? B: ___",
    choices: ["No, she isn't.", "I am fine.", "It is green.", "Two cats."],
    answerIndex: 0,
    explanation: "Is ... at home? には Yes, she is. か No, she isn't. と答えます。",
    japanese: "A: あなたのお母さんは家にいますか。B: いいえ、いません。"
  },
  {
    id: "eiken5-written-077",
    level: "英検5級",
    category: "grammar",
    question: "I ___ happy today.",
    choices: ["am", "have", "do", "go"],
    answerIndex: 0,
    explanation: "形容詞 happy の前には be 動詞を使います。",
    japanese: "私は今日うれしいです。"
  },
  {
    id: "eiken5-written-078",
    level: "英検5級",
    category: "vocabulary",
    question: "I can ___ English a little.",
    choices: ["speak", "eat", "drink", "wear"],
    answerIndex: 0,
    explanation: "言語に使う動詞は speak「話す」です。",
    japanese: "私は英語を少し話せます。"
  },
  {
    id: "eiken5-written-079",
    level: "英検5級",
    category: "phrase",
    question: "Stand ___.",
    choices: ["up", "on", "off", "in"],
    answerIndex: 0,
    explanation: "Stand up. は「立ちなさい」という表現です。",
    japanese: "起立してください。"
  },
  {
    id: "eiken5-written-080",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct word: I ___ soccer in the park.",
    choices: ["play", "plays", "playing", "played"],
    answerIndex: 0,
    explanation: "主語 I には動詞の原形 play を使います。",
    japanese: "正しい単語を選びなさい。私は公園でサッカーをします。"
  },
  {
    id: "eiken5-written-081",
    level: "英検5級",
    category: "grammar",
    question: "There ___ two chairs in the room.",
    choices: ["are", "is", "am", "be"],
    answerIndex: 0,
    explanation: "複数の名詞 two chairs には There are を使います。",
    japanese: "部屋に椅子が2脚あります。"
  },
  {
    id: "eiken5-written-082",
    level: "英検5級",
    category: "vocabulary",
    question: "My grandmother makes ___ soup.",
    choices: ["delicious", "fast", "long", "heavy"],
    answerIndex: 0,
    explanation: "食べ物を表す形容詞は delicious「おいしい」です。",
    japanese: "私の祖母はおいしいスープを作ります。"
  },
  {
    id: "eiken5-written-083",
    level: "英検5級",
    category: "conversation",
    question: "A: Where do you live? B: ___",
    choices: ["I live in Tokyo.", "I am twelve.", "She has a pen.", "It is cold."],
    answerIndex: 0,
    explanation: "Where do you live? には住んでいる場所を答えます。",
    japanese: "A: あなたはどこに住んでいますか。B: 東京に住んでいます。"
  },
  {
    id: "eiken5-written-084",
    level: "英検5級",
    category: "grammar",
    question: "I can ___ fast.",
    choices: ["run", "runs", "running", "ran"],
    answerIndex: 0,
    explanation: "can の後には動詞の原形を使います。",
    japanese: "私は速く走れます。"
  },
  {
    id: "eiken5-written-085",
    level: "英検5級",
    category: "vocabulary",
    question: "It is ___ today. We need an umbrella.",
    choices: ["rainy", "fast", "short", "sweet"],
    answerIndex: 0,
    explanation: "傘が必要な天気は rainy「雨の」です。",
    japanese: "今日は雨です。傘が必要です。"
  },
  {
    id: "eiken5-written-086",
    level: "英検5級",
    category: "phrase",
    question: "Come ___.",
    choices: ["in", "out", "up", "off"],
    answerIndex: 0,
    explanation: "Come in. は「入ってください」という表現です。",
    japanese: "入ってください。"
  },
  {
    id: "eiken5-written-087",
    level: "英検5級",
    category: "grammar",
    question: "___ this your pen?",
    choices: ["Is", "Are", "Am", "Do"],
    answerIndex: 0,
    explanation: "単数の名詞について Yes/No で答える疑問文は Is ... ? です。",
    japanese: "これはあなたのペンですか。"
  },
  {
    id: "eiken5-written-088",
    level: "英検5級",
    category: "vocabulary",
    question: "I go to ___ from Monday to Friday.",
    choices: ["school", "happy", "fast", "eat"],
    answerIndex: 0,
    explanation: "月曜日から金曜日まで行く場所は school「学校」です。",
    japanese: "私は月曜日から金曜日まで学校へ行きます。"
  },
  {
    id: "eiken5-written-089",
    level: "英検5級",
    category: "conversation",
    question: "A: How many students are in your class? B: ___",
    choices: ["There are thirty.", "It is big.", "I am twelve.", "She is nice."],
    answerIndex: 0,
    explanation: "How many ...? には数を答えます。",
    japanese: "A: クラスに何人の生徒がいますか。B: 30人います。"
  },
  {
    id: "eiken5-written-090",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct sentence.",
    choices: ["I can swim well.", "I can swims well.", "I swimming well.", "I well swim."],
    answerIndex: 0,
    explanation: "can の後には動詞の原形がきます。",
    japanese: "正しい文を選びなさい。私は上手に泳げます。"
  },
  {
    id: "eiken5-written-091",
    level: "英検5級",
    category: "grammar",
    question: "I like spring ___ summer.",
    choices: ["and", "but", "so", "or"],
    answerIndex: 0,
    explanation: "2つのものを並べるときは and を使います。",
    japanese: "私は春と夏が好きです。"
  },
  {
    id: "eiken5-written-092",
    level: "英検5級",
    category: "vocabulary",
    question: "I am ___ years old.",
    choices: ["eleven", "kind", "fast", "green"],
    answerIndex: 0,
    explanation: "years old の前には数を表す言葉がきます。eleven「11」が正しい数詞です。",
    japanese: "私は11歳です。"
  },
  {
    id: "eiken5-written-093",
    level: "英検5級",
    category: "phrase",
    question: "Open your ___.",
    choices: ["textbook", "fast", "happy", "big"],
    answerIndex: 0,
    explanation: "Open your textbook. は「教科書を開きなさい」という表現です。",
    japanese: "教科書を開きなさい。"
  },
  {
    id: "eiken5-written-094",
    level: "英検5級",
    category: "grammar",
    question: "My sister and I ___ in the same school.",
    choices: ["are", "is", "am", "be"],
    answerIndex: 0,
    explanation: "主語が複数（My sister and I）のときは are を使います。",
    japanese: "私の姉と私は同じ学校にいます。"
  },
  {
    id: "eiken5-written-095",
    level: "英検5級",
    category: "vocabulary",
    question: "My bag is very ___. I can't carry it alone.",
    choices: ["heavy", "fast", "sunny", "happy"],
    answerIndex: 0,
    explanation: "持てないほど重いことを heavy「重い」と言います。",
    japanese: "私のかばんはとても重いです。一人では持てません。"
  },
  {
    id: "eiken5-written-096",
    level: "英検5級",
    category: "conversation",
    question: "A: What is your favorite sport? B: ___",
    choices: ["I like basketball.", "It is blue.", "She runs fast.", "At school."],
    answerIndex: 0,
    explanation: "What is your favorite ...? には好きなものを答えます。",
    japanese: "A: あなたの好きなスポーツは何ですか。B: バスケットボールです。"
  },
  {
    id: "eiken5-written-097",
    level: "英検5級",
    category: "grammar",
    question: "She ___ to school by bus.",
    choices: ["goes", "go", "going", "went"],
    answerIndex: 0,
    explanation: "三人称単数 She には goes を使います。",
    japanese: "彼女はバスで学校へ行きます。"
  },
  {
    id: "eiken5-written-098",
    level: "英検5級",
    category: "vocabulary",
    question: "I put the book ___ the desk.",
    choices: ["on", "happy", "fast", "red"],
    answerIndex: 0,
    explanation: "置く場所を表す前置詞は on「〜の上に」です。",
    japanese: "私は本を机の上に置きます。"
  },
  {
    id: "eiken5-written-099",
    level: "英検5級",
    category: "phrase",
    question: "Let's play ___!",
    choices: ["together", "happy", "fast", "cold"],
    answerIndex: 0,
    explanation: "Let's play together. は「一緒に遊びましょう」という表現です。",
    japanese: "一緒に遊びましょう！"
  },
  {
    id: "eiken5-written-100",
    level: "英検5級",
    category: "writing",
    question: "Choose the correct word: I ___ breakfast at seven.",
    choices: ["eat", "eats", "eating", "ate"],
    answerIndex: 0,
    explanation: "主語 I には動詞の原形 eat を使います。",
    japanese: "正しい単語を選びなさい。私は7時に朝食を食べます。"
  }
];

export default eiken5Written001_100;
