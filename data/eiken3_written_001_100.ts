export type WrittenQuestion = {
  id: string;
  level: "eiken5" | "eiken4" | "eiken3" | "eiken_pre2";
  category: "vocabulary" | "grammar" | "phrase" | "conversation" | "writing";
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  japanese: string;
};

export const eiken3Written001_100: WrittenQuestion[] = [
  {
    id: "eiken3-written-001",
    level: "eiken3",
    category: "grammar",
    question: "I have studied English ___ I was ten.",
    choices: ["for", "since", "during", "until"],
    answerIndex: 1,
    explanation: "since は「〜以来」という意味で、始まりの時点を表します。",
    japanese: "私は10歳のときから英語を勉強しています。"
  },
  {
    id: "eiken3-written-002",
    level: "eiken3",
    category: "vocabulary",
    question: "Please ___ the door when you leave the room.",
    choices: ["spend", "build", "close", "carry"],
    answerIndex: 2,
    explanation: "close the door で「ドアを閉める」という意味です。",
    japanese: "部屋を出るときはドアを閉めてください。"
  },
  {
    id: "eiken3-written-003",
    level: "eiken3",
    category: "phrase",
    question: "I'm looking forward ___ seeing you again.",
    choices: ["at", "to", "for", "with"],
    answerIndex: 1,
    explanation: "look forward to ...ing で「〜するのを楽しみにする」という意味です。",
    japanese: "私はあなたにまた会えるのを楽しみにしています。"
  },
  {
    id: "eiken3-written-004",
    level: "eiken3",
    category: "conversation",
    question: "A: May I use your pen? B: ___",
    choices: ["No, I don't.", "It is mine.", "I used it.", "Sure. Here you are."],
    answerIndex: 3,
    explanation: "May I ...? と許可を求められたら Sure. が自然な返事です。",
    japanese: "A: あなたのペンを使ってもいいですか。B: もちろん。どうぞ。"
  },
  {
    id: "eiken3-written-005",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: ___ I was tired, I helped my mother.",
    choices: ["Although", "Because", "If", "Until"],
    answerIndex: 0,
    explanation: "Although は「〜だけれども」という意味で、逆の内容をつなぎます。",
    japanese: "最もよい文を選びなさい。疲れていましたが、私は母を手伝いました。"
  },
  {
    id: "eiken3-written-006",
    level: "eiken3",
    category: "grammar",
    question: "Ken wants ___ a doctor in the future.",
    choices: ["be", "being", "to be", "been"],
    answerIndex: 2,
    explanation: "want to do で「〜したい」という意味です。",
    japanese: "ケンは将来医者になりたいと思っています。"
  },
  {
    id: "eiken3-written-007",
    level: "eiken3",
    category: "vocabulary",
    question: "We will ___ at the station at nine.",
    choices: ["borrow", "arrive", "finish", "invite"],
    answerIndex: 1,
    explanation: "arrive at ... で「〜に到着する」という意味です。",
    japanese: "私たちは9時に駅に到着する予定です。"
  },
  {
    id: "eiken3-written-008",
    level: "eiken3",
    category: "phrase",
    question: "My sister is good ___ playing the piano.",
    choices: ["for", "with", "to", "at"],
    answerIndex: 3,
    explanation: "be good at ...ing で「〜するのが得意だ」という意味です。",
    japanese: "私の姉はピアノを弾くのが得意です。"
  },
  {
    id: "eiken3-written-009",
    level: "eiken3",
    category: "conversation",
    question: "A: How was your trip? B: ___",
    choices: ["I go by bus.", "It was wonderful.", "It is under the desk.", "At three o'clock."],
    answerIndex: 1,
    explanation: "How was ...? は感想をたずねる表現です。",
    japanese: "A: 旅行はどうでしたか。B: すばらしかったです。"
  },
  {
    id: "eiken3-written-010",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence for an email: Thank you for your letter. ___",
    choices: ["I am a station.", "I was very happy to read it.", "This is a red bag.", "Please rain tomorrow."],
    answerIndex: 1,
    explanation: "手紙への返事では、読んでうれしかったことを伝える文が自然です。",
    japanese: "メールに合う最もよい文を選びなさい。お手紙をありがとう。読んでとてもうれしかったです。"
  },
  {
    id: "eiken3-written-011",
    level: "eiken3",
    category: "grammar",
    question: "This bike is ___ than mine.",
    choices: ["fast", "fastest", "faster", "more fast"],
    answerIndex: 2,
    explanation: "than がある比較では、fast の比較級 faster を使います。",
    japanese: "この自転車は私のものより速いです。"
  },
  {
    id: "eiken3-written-012",
    level: "eiken3",
    category: "vocabulary",
    question: "I have a math test tomorrow, so I must ___ tonight.",
    choices: ["travel", "forget", "sell", "study"],
    answerIndex: 3,
    explanation: "test があるので study「勉強する」が合います。",
    japanese: "明日数学のテストがあるので、今夜勉強しなければなりません。"
  },
  {
    id: "eiken3-written-013",
    level: "eiken3",
    category: "phrase",
    question: "Please take care ___ my dog while I am away.",
    choices: ["with", "of", "to", "by"],
    answerIndex: 1,
    explanation: "take care of ... で「〜の世話をする」という意味です。",
    japanese: "私が留守の間、犬の世話をしてください。"
  },
  {
    id: "eiken3-written-014",
    level: "eiken3",
    category: "conversation",
    question: "A: Would you like some cake? B: ___",
    choices: ["It is sunny.", "I went there.", "Yes, please.", "She is my aunt."],
    answerIndex: 2,
    explanation: "Would you like ...? への承諾は Yes, please. が自然です。",
    japanese: "A: ケーキはいかがですか。B: はい、お願いします。"
  },
  {
    id: "eiken3-written-015",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: I have never ___ to Hokkaido.",
    choices: ["go", "went", "going", "been"],
    answerIndex: 3,
    explanation: "have never been to ... で「〜へ行ったことがない」という意味です。",
    japanese: "最もよい文を選びなさい。私は北海道へ行ったことがありません。"
  },
  {
    id: "eiken3-written-016",
    level: "eiken3",
    category: "grammar",
    question: "This song ___ by many people in Japan.",
    choices: ["sings", "singing", "is sung", "sang"],
    answerIndex: 2,
    explanation: "be動詞 + 過去分詞で受け身を表します。",
    japanese: "この歌は日本で多くの人に歌われています。"
  },
  {
    id: "eiken3-written-017",
    level: "eiken3",
    category: "vocabulary",
    question: "Can I ___ your eraser? I forgot mine.",
    choices: ["catch", "break", "answer", "borrow"],
    answerIndex: 3,
    explanation: "borrow は「借りる」という意味です。",
    japanese: "あなたの消しゴムを借りてもいいですか。自分のものを忘れました。"
  },
  {
    id: "eiken3-written-018",
    level: "eiken3",
    category: "phrase",
    question: "I get along ___ my classmates.",
    choices: ["to", "with", "for", "about"],
    answerIndex: 1,
    explanation: "get along with ... で「〜と仲よくする」という意味です。",
    japanese: "私はクラスメートと仲よくしています。"
  },
  {
    id: "eiken3-written-019",
    level: "eiken3",
    category: "conversation",
    question: "A: Excuse me. Where is the library? B: ___",
    choices: ["I like books.", "It opens at ten.", "It's next to the bank.", "I read it yesterday."],
    answerIndex: 2,
    explanation: "場所を聞かれているので、位置を答える文が合います。",
    japanese: "A: すみません。図書館はどこですか。B: 銀行の隣です。"
  },
  {
    id: "eiken3-written-020",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence to finish the note: I will call you ___.",
    choices: ["last year", "every yesterday", "by bus", "after dinner"],
    answerIndex: 3,
    explanation: "未来の予定には after dinner「夕食後」が自然です。",
    japanese: "メモを終える最もよい文を選びなさい。夕食後に電話します。"
  },
  {
    id: "eiken3-written-021",
    level: "eiken3",
    category: "grammar",
    question: "The girl ___ is reading a book is my cousin.",
    choices: ["where", "who", "when", "which"],
    answerIndex: 1,
    explanation: "人を説明する関係代名詞には who を使います。",
    japanese: "本を読んでいる女の子は私のいとこです。"
  },
  {
    id: "eiken3-written-022",
    level: "eiken3",
    category: "vocabulary",
    question: "It is important to ___ the environment.",
    choices: ["collect", "arrive", "protect", "decide"],
    answerIndex: 2,
    explanation: "protect は「守る」という意味です。",
    japanese: "環境を守ることは大切です。"
  },
  {
    id: "eiken3-written-023",
    level: "eiken3",
    category: "phrase",
    question: "___ the way, do you know my brother?",
    choices: ["On", "In", "By", "At"],
    answerIndex: 2,
    explanation: "By the way は「ところで」という会話表現です。",
    japanese: "ところで、あなたは私の兄を知っていますか。"
  },
  {
    id: "eiken3-written-024",
    level: "eiken3",
    category: "conversation",
    question: "A: I'm sorry I'm late. B: ___",
    choices: ["It's on the table.", "That's all right.", "I like winter.", "You are from Canada."],
    answerIndex: 1,
    explanation: "謝られたときは That's all right. で「大丈夫です」と返せます。",
    japanese: "A: 遅れてすみません。B: 大丈夫です。"
  },
  {
    id: "eiken3-written-025",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: I want to know ___ now.",
    choices: ["where is Tom", "where Tom is", "where Tom", "Tom where is"],
    answerIndex: 1,
    explanation: "間接疑問文では where Tom is の語順にします。",
    japanese: "最もよい文を選びなさい。私は今トムがどこにいるのか知りたいです。"
  },
  {
    id: "eiken3-written-026",
    level: "eiken3",
    category: "grammar",
    question: "My father enjoys ___ in the garden.",
    choices: ["work", "worked", "working", "to work"],
    answerIndex: 2,
    explanation: "enjoy の後ろは動名詞 working を使います。",
    japanese: "私の父は庭で働くことを楽しんでいます。"
  },
  {
    id: "eiken3-written-027",
    level: "eiken3",
    category: "vocabulary",
    question: "I got a ___ from my friend in Canada.",
    choices: ["ticket", "message", "weather", "homework"],
    answerIndex: 1,
    explanation: "message は「メッセージ、伝言」という意味です。",
    japanese: "私はカナダの友達からメッセージをもらいました。"
  },
  {
    id: "eiken3-written-028",
    level: "eiken3",
    category: "phrase",
    question: "There is a bus stop in front ___ our school.",
    choices: ["to", "at", "by", "of"],
    answerIndex: 3,
    explanation: "in front of ... で「〜の前に」という意味です。",
    japanese: "私たちの学校の前にバス停があります。"
  },
  {
    id: "eiken3-written-029",
    level: "eiken3",
    category: "conversation",
    question: "A: What time does the movie start? B: ___",
    choices: ["In the park.", "It was fun.", "With my sister.", "At seven thirty."],
    answerIndex: 3,
    explanation: "What time ...? には時刻を答えます。",
    japanese: "A: 映画は何時に始まりますか。B: 7時30分です。"
  },
  {
    id: "eiken3-written-030",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence for a diary: ___, I visited my grandparents.",
    choices: ["Next month", "Last Sunday", "Every tomorrow", "Soon later"],
    answerIndex: 1,
    explanation: "過去形 visited には Last Sunday のような過去の時が合います。",
    japanese: "日記に合う最もよい文を選びなさい。先週の日曜日、私は祖父母を訪ねました。"
  },
  {
    id: "eiken3-written-031",
    level: "eiken3",
    category: "grammar",
    question: "I was doing my homework ___ my mother came home.",
    choices: ["because", "when", "if", "before"],
    answerIndex: 1,
    explanation: "when は「〜したとき」という意味で、出来事の時を表します。",
    japanese: "母が帰宅したとき、私は宿題をしていました。"
  },
  {
    id: "eiken3-written-032",
    level: "eiken3",
    category: "vocabulary",
    question: "We bought two ___ for the concert.",
    choices: ["lessons", "tickets", "clouds", "kitchens"],
    answerIndex: 1,
    explanation: "concert に行くには tickets「チケット」が必要です。",
    japanese: "私たちはコンサートのチケットを2枚買いました。"
  },
  {
    id: "eiken3-written-033",
    level: "eiken3",
    category: "phrase",
    question: "Many students took part ___ the speech contest.",
    choices: ["on", "at", "in", "from"],
    answerIndex: 2,
    explanation: "take part in ... で「〜に参加する」という意味です。",
    japanese: "多くの生徒がスピーチコンテストに参加しました。"
  },
  {
    id: "eiken3-written-034",
    level: "eiken3",
    category: "conversation",
    question: "A: Could you help me with this box? B: ___",
    choices: ["It is green.", "I bought milk.", "At school.", "Of course."],
    answerIndex: 3,
    explanation: "手伝いを頼まれたとき、Of course. は「もちろん」です。",
    japanese: "A: この箱を運ぶのを手伝ってくれますか。B: もちろんです。"
  },
  {
    id: "eiken3-written-035",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: This is the park ___ I play soccer.",
    choices: ["who", "which", "what", "where"],
    answerIndex: 3,
    explanation: "場所を説明するときは where を使います。",
    japanese: "最もよい文を選びなさい。ここは私がサッカーをする公園です。"
  },
  {
    id: "eiken3-written-036",
    level: "eiken3",
    category: "grammar",
    question: "You should ___ your hands before dinner.",
    choices: ["washed", "washing", "wash", "to wash"],
    answerIndex: 2,
    explanation: "should の後ろは動詞の原形を使います。",
    japanese: "夕食の前に手を洗うべきです。"
  },
  {
    id: "eiken3-written-037",
    level: "eiken3",
    category: "vocabulary",
    question: "My uncle lives ___, so he speaks English every day.",
    choices: ["quietly", "early", "abroad", "inside"],
    answerIndex: 2,
    explanation: "abroad は「海外で、海外へ」という意味です。",
    japanese: "私のおじは海外に住んでいるので、毎日英語を話します。"
  },
  {
    id: "eiken3-written-038",
    level: "eiken3",
    category: "phrase",
    question: "At ___, I didn't understand the rule.",
    choices: ["last", "first", "least", "once"],
    answerIndex: 1,
    explanation: "at first は「最初は」という意味です。",
    japanese: "最初は、私はそのルールがわかりませんでした。"
  },
  {
    id: "eiken3-written-039",
    level: "eiken3",
    category: "conversation",
    question: "A: What's the matter? B: ___",
    choices: ["It's ten dollars.", "I like soccer.", "I have a headache.", "She is tall."],
    answerIndex: 2,
    explanation: "What's the matter? は体調や問題をたずねる表現です。",
    japanese: "A: どうしましたか。B: 頭が痛いです。"
  },
  {
    id: "eiken3-written-040",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence to ask a teacher: ___ I ask a question?",
    choices: ["Must", "Will", "Do", "May"],
    answerIndex: 3,
    explanation: "May I ...? は丁寧に許可を求める表現です。",
    japanese: "先生にたずねる最もよい文を選びなさい。質問してもよろしいですか。"
  },
  {
    id: "eiken3-written-041",
    level: "eiken3",
    category: "grammar",
    question: "The cake ___ by my sister yesterday.",
    choices: ["made", "was made", "is making", "makes"],
    answerIndex: 1,
    explanation: "過去の受け身は was/were + 過去分詞で表します。",
    japanese: "そのケーキは昨日、私の姉によって作られました。"
  },
  {
    id: "eiken3-written-042",
    level: "eiken3",
    category: "vocabulary",
    question: "The museum was very ___, so we learned a lot.",
    choices: ["hungry", "interesting", "sleepy", "cloudy"],
    answerIndex: 1,
    explanation: "interesting は「おもしろい、興味深い」という意味です。",
    japanese: "その博物館はとても興味深かったので、私たちはたくさん学びました。"
  },
  {
    id: "eiken3-written-043",
    level: "eiken3",
    category: "phrase",
    question: "We are ___ a hurry. The train leaves soon.",
    choices: ["on", "at", "to", "in"],
    answerIndex: 3,
    explanation: "in a hurry で「急いで」という意味です。",
    japanese: "私たちは急いでいます。電車がもうすぐ出ます。"
  },
  {
    id: "eiken3-written-044",
    level: "eiken3",
    category: "conversation",
    question: "A: How often do you play tennis? B: ___",
    choices: ["Twice a week.", "Last year.", "At the station.", "It is mine."],
    answerIndex: 0,
    explanation: "How often ...? には頻度を答えます。",
    japanese: "A: どのくらいの頻度でテニスをしますか。B: 週に2回です。"
  },
  {
    id: "eiken3-written-045",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: Reading books ___ important for children.",
    choices: ["are", "were", "be", "is"],
    answerIndex: 3,
    explanation: "動名詞 Reading books は1つのこととして扱い、is を使います。",
    japanese: "最もよい文を選びなさい。本を読むことは子どもにとって大切です。"
  },
  {
    id: "eiken3-written-046",
    level: "eiken3",
    category: "grammar",
    question: "Tom is the ___ student in his class.",
    choices: ["tall", "taller", "tallest", "most tall"],
    answerIndex: 2,
    explanation: "the がある最上級では tallest を使います。",
    japanese: "トムはクラスで一番背が高い生徒です。"
  },
  {
    id: "eiken3-written-047",
    level: "eiken3",
    category: "vocabulary",
    question: "Please ___ me to your birthday party.",
    choices: ["hurt", "miss", "wear", "invite"],
    answerIndex: 3,
    explanation: "invite は「招待する」という意味です。",
    japanese: "私をあなたの誕生日会に招待してください。"
  },
  {
    id: "eiken3-written-048",
    level: "eiken3",
    category: "phrase",
    question: "Kyoto is famous ___ its old temples.",
    choices: ["to", "for", "with", "by"],
    answerIndex: 1,
    explanation: "be famous for ... で「〜で有名だ」という意味です。",
    japanese: "京都は古い寺で有名です。"
  },
  {
    id: "eiken3-written-049",
    level: "eiken3",
    category: "conversation",
    question: "A: Can I try this shirt on? B: ___",
    choices: ["I like apples.", "It is Tuesday.", "The fitting room is over there.", "I went home."],
    answerIndex: 2,
    explanation: "服を試着したい人には試着室の場所を案内する返事が自然です。",
    japanese: "A: このシャツを試着してもいいですか。B: 試着室はあちらです。"
  },
  {
    id: "eiken3-written-050",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence for a postcard: The sea is beautiful here. ___",
    choices: ["I am enjoying my vacation.", "He studies math every night.", "This desk is heavy.", "Please close the window."],
    answerIndex: 0,
    explanation: "旅先のはがきでは、休暇を楽しんでいる文が自然につながります。",
    japanese: "はがきに合う最もよい文を選びなさい。ここの海は美しいです。私は休暇を楽しんでいます。"
  },
  {
    id: "eiken3-written-051",
    level: "eiken3",
    category: "grammar",
    question: "I have already ___ my lunch.",
    choices: ["eat", "ate", "eaten", "eating"],
    answerIndex: 2,
    explanation: "現在完了では have + 過去分詞を使います。eat の過去分詞は eaten です。",
    japanese: "私はもう昼食を食べました。"
  },
  {
    id: "eiken3-written-052",
    level: "eiken3",
    category: "vocabulary",
    question: "We need to buy some food because the fridge is ___.",
    choices: ["popular", "kind", "empty", "strong"],
    answerIndex: 2,
    explanation: "empty は「空の」という意味です。",
    japanese: "冷蔵庫が空なので、私たちは食べ物を買う必要があります。"
  },
  {
    id: "eiken3-written-053",
    level: "eiken3",
    category: "phrase",
    question: "There are a lot ___ flowers in the park.",
    choices: ["to", "of", "at", "for"],
    answerIndex: 1,
    explanation: "a lot of ... で「たくさんの〜」という意味です。",
    japanese: "公園にはたくさんの花があります。"
  },
  {
    id: "eiken3-written-054",
    level: "eiken3",
    category: "conversation",
    question: "A: Shall we go to the park after lunch? B: ___",
    choices: ["It is a pencil.", "I was born in May.", "She can swim.", "That's a good idea."],
    answerIndex: 3,
    explanation: "提案に賛成するときは That's a good idea. が自然です。",
    japanese: "A: 昼食後に公園へ行きませんか。B: いい考えですね。"
  },
  {
    id: "eiken3-written-055",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: Please tell me ___ to get to the museum.",
    choices: ["what", "who", "why", "how"],
    answerIndex: 3,
    explanation: "how to get to ... で「〜への行き方」という意味です。",
    japanese: "最もよい文を選びなさい。博物館への行き方を教えてください。"
  },
  {
    id: "eiken3-written-056",
    level: "eiken3",
    category: "grammar",
    question: "If it ___ tomorrow, we will stay home.",
    choices: ["rain", "rained", "rains", "will rain"],
    answerIndex: 2,
    explanation: "時や条件を表す if の節では、未来のことでも現在形を使います。",
    japanese: "もし明日雨が降れば、私たちは家にいるでしょう。"
  },
  {
    id: "eiken3-written-057",
    level: "eiken3",
    category: "vocabulary",
    question: "My neighbor is very ___ and always helps us.",
    choices: ["late", "deep", "noisy", "kind"],
    answerIndex: 3,
    explanation: "kind は「親切な」という意味です。",
    japanese: "私の近所の人はとても親切で、いつも私たちを助けてくれます。"
  },
  {
    id: "eiken3-written-058",
    level: "eiken3",
    category: "phrase",
    question: "My teacher gave us an example, ___ example, a short email.",
    choices: ["by", "for", "at", "in"],
    answerIndex: 1,
    explanation: "for example は「たとえば」という意味です。",
    japanese: "先生は私たちに例を出しました。たとえば、短いメールです。"
  },
  {
    id: "eiken3-written-059",
    level: "eiken3",
    category: "conversation",
    question: "A: Do you mind opening the window? B: ___",
    choices: ["I am twelve.", "It is delicious.", "On Sunday.", "No, not at all."],
    answerIndex: 3,
    explanation: "Do you mind ...? で頼まれたとき、No, not at all. は「いいですよ」です。",
    japanese: "A: 窓を開けてもらえますか。B: いいですよ。"
  },
  {
    id: "eiken3-written-060",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: The movie was so exciting ___ I watched it twice.",
    choices: ["if", "when", "but", "that"],
    answerIndex: 3,
    explanation: "so ... that で「とても〜なので…」という意味です。",
    japanese: "最もよい文を選びなさい。その映画はとてもわくわくしたので、私は2回見ました。"
  },
  {
    id: "eiken3-written-061",
    level: "eiken3",
    category: "grammar",
    question: "The book ___ I bought yesterday is interesting.",
    choices: ["who", "that", "where", "when"],
    answerIndex: 1,
    explanation: "物を説明する関係代名詞には that や which を使います。",
    japanese: "私が昨日買った本はおもしろいです。"
  },
  {
    id: "eiken3-written-062",
    level: "eiken3",
    category: "vocabulary",
    question: "I made a ___ to meet Yuki at the station.",
    choices: ["river", "season", "library", "promise"],
    answerIndex: 3,
    explanation: "make a promise で「約束をする」という意味です。",
    japanese: "私は駅でユキに会う約束をしました。"
  },
  {
    id: "eiken3-written-063",
    level: "eiken3",
    category: "phrase",
    question: "We had a good ___ at the school festival.",
    choices: ["way", "hand", "time", "place"],
    answerIndex: 2,
    explanation: "have a good time で「楽しい時間を過ごす」という意味です。",
    japanese: "私たちは学校祭で楽しい時間を過ごしました。"
  },
  {
    id: "eiken3-written-064",
    level: "eiken3",
    category: "conversation",
    question: "A: Could you say that again? B: ___",
    choices: ["I don't like tests.", "It is my bag.", "Yes, I can run fast.", "Sure. I said the test is tomorrow."],
    answerIndex: 3,
    explanation: "もう一度言ってほしいと言われたら、内容を繰り返す返事が自然です。",
    japanese: "A: もう一度言ってくれますか。B: もちろんです。テストは明日だと言いました。"
  },
  {
    id: "eiken3-written-065",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: I am interested ___ learning about animals.",
    choices: ["to", "for", "with", "in"],
    answerIndex: 3,
    explanation: "be interested in ...ing で「〜することに興味がある」という意味です。",
    japanese: "最もよい文を選びなさい。私は動物について学ぶことに興味があります。"
  },
  {
    id: "eiken3-written-066",
    level: "eiken3",
    category: "grammar",
    question: "This problem is ___ difficult for me to answer.",
    choices: ["enough", "very much", "many", "too"],
    answerIndex: 3,
    explanation: "too ... to do で「あまりに〜なので…できない」という意味です。",
    japanese: "この問題は難しすぎて、私には答えられません。"
  },
  {
    id: "eiken3-written-067",
    level: "eiken3",
    category: "vocabulary",
    question: "The road is not ___ at night, so be careful.",
    choices: ["safe", "brightly", "delicious", "famous"],
    answerIndex: 0,
    explanation: "safe は「安全な」という意味です。",
    japanese: "その道は夜は安全ではないので、気をつけてください。"
  },
  {
    id: "eiken3-written-068",
    level: "eiken3",
    category: "phrase",
    question: "Don't be afraid to make a ___.",
    choices: ["mistake", "station", "holiday", "noise"],
    answerIndex: 0,
    explanation: "make a mistake で「間違える」という意味です。",
    japanese: "間違えることを恐れないでください。"
  },
  {
    id: "eiken3-written-069",
    level: "eiken3",
    category: "conversation",
    question: "A: How much is this notebook? B: ___",
    choices: ["It's 150 yen.", "It is near my house.", "I wrote a letter.", "Every morning."],
    answerIndex: 0,
    explanation: "How much ...? には値段を答えます。",
    japanese: "A: このノートはいくらですか。B: 150円です。"
  },
  {
    id: "eiken3-written-070",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence for a report: We should use less plastic ___ it helps the earth.",
    choices: ["because", "until", "before", "or"],
    answerIndex: 0,
    explanation: "because は理由を表し、「なぜなら〜だから」という意味です。",
    japanese: "レポートに合う最もよい文を選びなさい。地球のためになるので、私たちはプラスチックをあまり使わないようにすべきです。"
  },
  {
    id: "eiken3-written-071",
    level: "eiken3",
    category: "grammar",
    question: "Have you ever ___ a koala?",
    choices: ["see", "saw", "seen", "seeing"],
    answerIndex: 2,
    explanation: "現在完了の経験では have + 過去分詞を使います。see の過去分詞は seen です。",
    japanese: "あなたはコアラを見たことがありますか。"
  },
  {
    id: "eiken3-written-072",
    level: "eiken3",
    category: "vocabulary",
    question: "It is ___ to bring a passport when you travel abroad.",
    choices: ["quiet", "similar", "necessary", "weak"],
    answerIndex: 2,
    explanation: "necessary は「必要な」という意味です。",
    japanese: "海外旅行をするときはパスポートを持って行くことが必要です。"
  },
  {
    id: "eiken3-written-073",
    level: "eiken3",
    category: "phrase",
    question: "We should get ___ the bus at the next stop.",
    choices: ["off", "into", "over", "through"],
    answerIndex: 0,
    explanation: "get off the bus で「バスを降りる」という意味です。",
    japanese: "私たちは次の停留所でバスを降りるべきです。"
  },
  {
    id: "eiken3-written-074",
    level: "eiken3",
    category: "conversation",
    question: "A: What do you think of this plan? B: ___",
    choices: ["I think it's great.", "It is on Monday.", "She lives in Nara.", "I have two brothers."],
    answerIndex: 0,
    explanation: "What do you think of ...? には意見を答えます。",
    japanese: "A: この計画をどう思いますか。B: とてもよいと思います。"
  },
  {
    id: "eiken3-written-075",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: My brother is old enough ___ alone.",
    choices: ["travel", "traveling", "traveled", "to travel"],
    answerIndex: 3,
    explanation: "old enough to do で「〜するのに十分な年齢だ」という意味です。",
    japanese: "最もよい文を選びなさい。私の兄は一人で旅行できる年齢です。"
  },
  {
    id: "eiken3-written-076",
    level: "eiken3",
    category: "grammar",
    question: "There are ___ apples in the basket.",
    choices: ["much", "any", "some", "little"],
    answerIndex: 2,
    explanation: "数えられる名詞の複数形 apples には some を使えます。",
    japanese: "かごの中にリンゴがいくつかあります。"
  },
  {
    id: "eiken3-written-077",
    level: "eiken3",
    category: "vocabulary",
    question: "I will ___ my room before my friends come.",
    choices: ["clean", "grow", "borrow", "wear"],
    answerIndex: 0,
    explanation: "clean は「掃除する」という意味です。",
    japanese: "友達が来る前に、私は自分の部屋を掃除します。"
  },
  {
    id: "eiken3-written-078",
    level: "eiken3",
    category: "phrase",
    question: "Please call me as soon ___ you arrive.",
    choices: ["as", "than", "so", "if"],
    answerIndex: 0,
    explanation: "as soon as ... で「〜するとすぐに」という意味です。",
    japanese: "到着したらすぐに私に電話してください。"
  },
  {
    id: "eiken3-written-079",
    level: "eiken3",
    category: "conversation",
    question: "A: I'm going to move to Osaka next month. B: ___",
    choices: ["Really? Good luck!", "It is under the chair.", "I ate breakfast.", "No, I can't swim."],
    answerIndex: 0,
    explanation: "相手の予定を聞いたときは、驚きや応援の返事が自然です。",
    japanese: "A: 来月大阪に引っ越す予定です。B: 本当ですか。がんばってください。"
  },
  {
    id: "eiken3-written-080",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: My mother asked me ___ dinner.",
    choices: ["cook", "cooking", "cooked", "to cook"],
    answerIndex: 3,
    explanation: "ask 人 to do で「人に〜するよう頼む」という意味です。",
    japanese: "最もよい文を選びなさい。母は私に夕食を作るよう頼みました。"
  },
  {
    id: "eiken3-written-081",
    level: "eiken3",
    category: "grammar",
    question: "I don't know ___ he lives.",
    choices: ["where", "what", "who", "whose"],
    answerIndex: 0,
    explanation: "場所を表す内容には where を使います。",
    japanese: "私は彼がどこに住んでいるのか知りません。"
  },
  {
    id: "eiken3-written-082",
    level: "eiken3",
    category: "vocabulary",
    question: "We had a wonderful ___ during our trip to Okinawa.",
    choices: ["experience", "umbrella", "dictionary", "kitchen"],
    answerIndex: 0,
    explanation: "experience は「経験、体験」という意味です。",
    japanese: "沖縄への旅行中、私たちはすばらしい体験をしました。"
  },
  {
    id: "eiken3-written-083",
    level: "eiken3",
    category: "phrase",
    question: "Put ___ your coat. It is cold outside.",
    choices: ["off", "up", "on", "away"],
    answerIndex: 2,
    explanation: "put on ... で「〜を身につける」という意味です。",
    japanese: "コートを着なさい。外は寒いです。"
  },
  {
    id: "eiken3-written-084",
    level: "eiken3",
    category: "conversation",
    question: "A: Why were you absent yesterday? B: ___",
    choices: ["Because I had a fever.", "At my school.", "It is blue.", "I like music."],
    answerIndex: 0,
    explanation: "Why ...? には Because ... で理由を答えます。",
    japanese: "A: なぜ昨日欠席したのですか。B: 熱があったからです。"
  },
  {
    id: "eiken3-written-085",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence for a thank-you card: ___ for helping me yesterday.",
    choices: ["Thank you", "Excuse me", "See you", "Welcome home"],
    answerIndex: 0,
    explanation: "感謝を伝えるカードでは Thank you for ... が自然です。",
    japanese: "お礼のカードに合う最もよい文を選びなさい。昨日手伝ってくれてありがとう。"
  },
  {
    id: "eiken3-written-086",
    level: "eiken3",
    category: "grammar",
    question: "English is spoken ___ many countries.",
    choices: ["by", "in", "to", "of"],
    answerIndex: 1,
    explanation: "国や場所の中で話されていることを表すときは in を使います。",
    japanese: "英語は多くの国で話されています。"
  },
  {
    id: "eiken3-written-087",
    level: "eiken3",
    category: "vocabulary",
    question: "My sister wants to become a ___ because she likes helping sick people.",
    choices: ["nurse", "river", "season", "ticket"],
    answerIndex: 0,
    explanation: "nurse は「看護師」という意味です。",
    japanese: "私の姉は病気の人を助けるのが好きなので、看護師になりたいと思っています。"
  },
  {
    id: "eiken3-written-088",
    level: "eiken3",
    category: "phrase",
    question: "Don't be late ___ school.",
    choices: ["of", "to", "for", "with"],
    answerIndex: 2,
    explanation: "be late for ... で「〜に遅れる」という意味です。",
    japanese: "学校に遅れないでください。"
  },
  {
    id: "eiken3-written-089",
    level: "eiken3",
    category: "conversation",
    question: "A: What are you going to do this weekend? B: ___",
    choices: ["I visited my aunt.", "I'm going to watch a soccer game.", "It is near the sea.", "She is kind."],
    answerIndex: 1,
    explanation: "be going to do で未来の予定を答えます。",
    japanese: "A: 今週末は何をする予定ですか。B: サッカーの試合を見る予定です。"
  },
  {
    id: "eiken3-written-090",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: This is the camera ___ my father gave me.",
    choices: ["who", "when", "that", "where"],
    answerIndex: 2,
    explanation: "物を説明する関係代名詞には that を使えます。",
    japanese: "最もよい文を選びなさい。これは父が私にくれたカメラです。"
  },
  {
    id: "eiken3-written-091",
    level: "eiken3",
    category: "grammar",
    question: "My grandmother has lived here ___ more than fifty years.",
    choices: ["since", "for", "from", "during"],
    answerIndex: 1,
    explanation: "期間を表す more than fifty years には for を使います。",
    japanese: "私の祖母は50年以上ここに住んでいます。"
  },
  {
    id: "eiken3-written-092",
    level: "eiken3",
    category: "vocabulary",
    question: "We must ___ which club to join by Friday.",
    choices: ["decide", "carry", "laugh", "sleep"],
    answerIndex: 0,
    explanation: "decide は「決める」という意味です。",
    japanese: "私たちは金曜日までにどのクラブに入るか決めなければなりません。"
  },
  {
    id: "eiken3-written-093",
    level: "eiken3",
    category: "phrase",
    question: "Please hand ___ your report by tomorrow.",
    choices: ["in", "out", "off", "over"],
    answerIndex: 0,
    explanation: "hand in ... で「〜を提出する」という意味です。",
    japanese: "明日までにレポートを提出してください。"
  },
  {
    id: "eiken3-written-094",
    level: "eiken3",
    category: "conversation",
    question: "A: I passed the English test. B: ___",
    choices: ["Congratulations!", "It is raining.", "I need a ticket.", "At the door."],
    answerIndex: 0,
    explanation: "合格した相手には Congratulations! と祝うのが自然です。",
    japanese: "A: 英語のテストに合格しました。B: おめでとう。"
  },
  {
    id: "eiken3-written-095",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: I went to bed early ___ I was very sleepy.",
    choices: ["because", "but", "or", "before"],
    answerIndex: 0,
    explanation: "because は理由を表します。",
    japanese: "最もよい文を選びなさい。とても眠かったので、私は早く寝ました。"
  },
  {
    id: "eiken3-written-096",
    level: "eiken3",
    category: "grammar",
    question: "This computer is as ___ as that one.",
    choices: ["new", "newer", "newest", "more new"],
    answerIndex: 0,
    explanation: "as ... as の間には形容詞の原級を入れます。",
    japanese: "このコンピューターはあれと同じくらい新しいです。"
  },
  {
    id: "eiken3-written-097",
    level: "eiken3",
    category: "vocabulary",
    question: "Please write your name and ___ on this form.",
    choices: ["address", "weather", "forest", "festival"],
    answerIndex: 0,
    explanation: "address は「住所」という意味です。",
    japanese: "この用紙に名前と住所を書いてください。"
  },
  {
    id: "eiken3-written-098",
    level: "eiken3",
    category: "phrase",
    question: "Let's take a ___ after studying for an hour.",
    choices: ["break", "dream", "picture", "seat"],
    answerIndex: 0,
    explanation: "take a break で「休憩する」という意味です。",
    japanese: "1時間勉強した後、休憩しましょう。"
  },
  {
    id: "eiken3-written-099",
    level: "eiken3",
    category: "conversation",
    question: "A: May I speak to Ms. Tanaka? B: ___",
    choices: ["Speaking.", "I am hungry.", "It is ten minutes.", "You are welcome."],
    answerIndex: 0,
    explanation: "電話で本人が出ている場合、Speaking. と答えます。",
    japanese: "A: 田中さんはいらっしゃいますか。B: 私です。"
  },
  {
    id: "eiken3-written-100",
    level: "eiken3",
    category: "writing",
    question: "Choose the best sentence: I have just ___ my homework.",
    choices: ["finish", "finished", "finishing", "to finish"],
    answerIndex: 1,
    explanation: "現在完了では have + 過去分詞を使います。finish の過去分詞は finished です。",
    japanese: "最もよい文を選びなさい。私はちょうど宿題を終えたところです。"
  }
];

export default eiken3Written001_100;
