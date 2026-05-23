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

export const eiken4Written001_100: WrittenQuestion[] = [
  {
    id: "eiken4-written-001",
    level: "英検4級",
    category: "grammar",
    question: "I ___ my homework last night.",
    choices: ["did", "do", "does", "doing"],
    answerIndex: 0,
    explanation: "last night という過去の時があるので、過去形 did を使います。",
    japanese: "私は昨夜宿題をしました。"
  },
  {
    id: "eiken4-written-002",
    level: "英検4級",
    category: "vocabulary",
    question: "My mother ___ breakfast early every day.",
    choices: ["cooks", "travels", "sleeps", "reads"],
    answerIndex: 0,
    explanation: "breakfast「朝食」に合う動詞は cooks「料理する」です。",
    japanese: "私の母は毎日早く朝食を作ります。"
  },
  {
    id: "eiken4-written-003",
    level: "英検4級",
    category: "conversation",
    question: "A: What did you do yesterday? B: ___",
    choices: ["I went to the library.", "I like summer.", "She is tall.", "It is cold."],
    answerIndex: 0,
    explanation: "What did you do ...? には過去の行動を答えます。",
    japanese: "A: 昨日は何をしましたか。B: 図書館へ行きました。"
  },
  {
    id: "eiken4-written-004",
    level: "英検4級",
    category: "grammar",
    question: "I will ___ my friend tomorrow.",
    choices: ["visit", "visits", "visited", "visiting"],
    answerIndex: 0,
    explanation: "will の後には動詞の原形を使います。",
    japanese: "私は明日友達を訪ねます。"
  },
  {
    id: "eiken4-written-005",
    level: "英検4級",
    category: "vocabulary",
    question: "My ___ subject is science. I love experiments.",
    choices: ["favorite", "tall", "fast", "old"],
    answerIndex: 0,
    explanation: "一番好きな科目を表すのは favorite「大好きな」です。",
    japanese: "私の大好きな科目は理科です。実験が大好きです。"
  },
  {
    id: "eiken4-written-006",
    level: "英検4級",
    category: "phrase",
    question: "I am ___ my homework now.",
    choices: ["doing", "do", "did", "done"],
    answerIndex: 0,
    explanation: "am + 動詞 -ing で現在進行形を作ります。",
    japanese: "私は今宿題をしているところです。"
  },
  {
    id: "eiken4-written-007",
    level: "英検4級",
    category: "grammar",
    question: "She ___ tennis last week.",
    choices: ["played", "plays", "play", "playing"],
    answerIndex: 0,
    explanation: "last week という過去の時があるので、過去形 played を使います。",
    japanese: "彼女は先週テニスをしました。"
  },
  {
    id: "eiken4-written-008",
    level: "英検4級",
    category: "vocabulary",
    question: "We ___ to the zoo last summer.",
    choices: ["went", "go", "goes", "going"],
    answerIndex: 0,
    explanation: "last summer という過去の時があるので、go の過去形 went を使います。",
    japanese: "私たちは去年の夏に動物園へ行きました。"
  },
  {
    id: "eiken4-written-009",
    level: "英検4級",
    category: "conversation",
    question: "A: Did you enjoy the party? B: ___",
    choices: ["Yes, it was great.", "I am happy.", "She is kind.", "It is blue."],
    answerIndex: 0,
    explanation: "Did you ...? には Yes か No で始まる文で答えます。",
    japanese: "A: パーティーを楽しみましたか。B: はい、すばらしかったです。"
  },
  {
    id: "eiken4-written-010",
    level: "英検4級",
    category: "writing",
    question: "Choose the best word: My family ___ to the mountains last weekend.",
    choices: ["went", "go", "goes", "going"],
    answerIndex: 0,
    explanation: "last weekend という過去の時があるので、go の過去形 went を使います。",
    japanese: "最もよい単語を選びなさい。私の家族は先週末に山へ行きました。"
  },
  {
    id: "eiken4-written-011",
    level: "英検4級",
    category: "grammar",
    question: "Tom is ___ a book now.",
    choices: ["reading", "read", "reads", "to read"],
    answerIndex: 0,
    explanation: "is + 動詞 -ing で現在進行形を作ります。",
    japanese: "トムは今本を読んでいます。"
  },
  {
    id: "eiken4-written-012",
    level: "英検4級",
    category: "vocabulary",
    question: "I feel ___ because I ate too much.",
    choices: ["sick", "tall", "fast", "cold"],
    answerIndex: 0,
    explanation: "食べ過ぎて体の具合が悪いときは sick「気分が悪い」と言います。",
    japanese: "食べ過ぎたので、気分が悪いです。"
  },
  {
    id: "eiken4-written-013",
    level: "英検4級",
    category: "phrase",
    question: "Can you ___ me a favor?",
    choices: ["do", "make", "give", "take"],
    answerIndex: 0,
    explanation: "do me a favor で「お願いを聞く」という意味です。",
    japanese: "お願いがあるのですが。"
  },
  {
    id: "eiken4-written-014",
    level: "英検4級",
    category: "grammar",
    question: "I ___ my bag. I can't find it anywhere.",
    choices: ["lost", "lose", "losing", "loses"],
    answerIndex: 0,
    explanation: "見つからない状況なので、過去形 lost を使います。",
    japanese: "かばんをなくしました。どこにも見つかりません。"
  },
  {
    id: "eiken4-written-015",
    level: "英検4級",
    category: "vocabulary",
    question: "My grandfather is very ___ and wise.",
    choices: ["old", "fast", "red", "round"],
    answerIndex: 0,
    explanation: "wise「賢い」と並ぶ形容詞として old「年をとった」が合います。",
    japanese: "私の祖父はとても年老いていて賢いです。"
  },
  {
    id: "eiken4-written-016",
    level: "英検4級",
    category: "conversation",
    question: "A: When is your birthday? B: ___",
    choices: ["It is in June.", "I am thirteen.", "She is my friend.", "He likes cats."],
    answerIndex: 0,
    explanation: "When is ...? には時を答えます。",
    japanese: "A: あなたの誕生日はいつですか。B: 6月です。"
  },
  {
    id: "eiken4-written-017",
    level: "英検4級",
    category: "grammar",
    question: "There ___ many people at the station.",
    choices: ["were", "was", "are", "is"],
    answerIndex: 0,
    explanation: "複数の people には were（過去）を使います。",
    japanese: "駅にはたくさんの人がいました。"
  },
  {
    id: "eiken4-written-018",
    level: "英検4級",
    category: "vocabulary",
    question: "I need to ___ some money to buy a new game.",
    choices: ["save", "lose", "forget", "break"],
    answerIndex: 0,
    explanation: "お金を貯めることを save「貯める」と言います。",
    japanese: "新しいゲームを買うためにお金を貯める必要があります。"
  },
  {
    id: "eiken4-written-019",
    level: "英検4級",
    category: "phrase",
    question: "I'm ___ to school by bicycle.",
    choices: ["going", "go", "went", "gone"],
    answerIndex: 0,
    explanation: "am + -ing で現在進行形を作ります。",
    japanese: "私は自転車で学校へ行くところです。"
  },
  {
    id: "eiken4-written-020",
    level: "英検4級",
    category: "writing",
    question: "Choose the best sentence: It ___ cold yesterday, so I wore a coat.",
    choices: ["was", "is", "were", "are"],
    answerIndex: 0,
    explanation: "yesterday という過去の時があり、主語が It なので was を使います。",
    japanese: "最もよい文を選びなさい。昨日は寒かったので、コートを着ました。"
  },
  {
    id: "eiken4-written-021",
    level: "英検4級",
    category: "grammar",
    question: "I like ___ music.",
    choices: ["listening to", "listen", "listened", "listens"],
    answerIndex: 0,
    explanation: "like の後に動名詞を使う場合、listening to music となります。",
    japanese: "私は音楽を聴くのが好きです。"
  },
  {
    id: "eiken4-written-022",
    level: "英検4級",
    category: "vocabulary",
    question: "Please ___ the window. It is very hot in here.",
    choices: ["open", "close", "break", "clean"],
    answerIndex: 0,
    explanation: "暑いので open「開ける」が合います。",
    japanese: "窓を開けてください。ここはとても暑いです。"
  },
  {
    id: "eiken4-written-023",
    level: "英検4級",
    category: "conversation",
    question: "A: What are you doing now? B: ___",
    choices: ["I'm cooking dinner.", "I went to school.", "She is happy.", "It is Tuesday."],
    answerIndex: 0,
    explanation: "What are you doing now? には現在の行動を答えます。",
    japanese: "A: 今何をしていますか。B: 夕食を作っています。"
  },
  {
    id: "eiken4-written-024",
    level: "英検4級",
    category: "grammar",
    question: "She was happy ___ she got a present.",
    choices: ["because", "until", "before", "after"],
    answerIndex: 0,
    explanation: "because は理由を表し、「なぜなら〜だから」という意味です。",
    japanese: "彼女はプレゼントをもらったので、うれしかったです。"
  },
  {
    id: "eiken4-written-025",
    level: "英検4級",
    category: "vocabulary",
    question: "I need to ___ my teeth every day.",
    choices: ["brush", "wash", "cut", "dry"],
    answerIndex: 0,
    explanation: "teeth「歯」に使う動詞は brush「磨く」です。",
    japanese: "私は毎日歯を磨く必要があります。"
  },
  {
    id: "eiken4-written-026",
    level: "英検4級",
    category: "phrase",
    question: "How ___ is the train from here?",
    choices: ["far", "long", "big", "tall"],
    answerIndex: 0,
    explanation: "距離をたずねるときは How far is ...? を使います。",
    japanese: "ここから駅はどのくらい遠いですか。"
  },
  {
    id: "eiken4-written-027",
    level: "英検4級",
    category: "grammar",
    question: "I was ___ when I heard the news.",
    choices: ["surprised", "surprise", "surprising", "surprises"],
    answerIndex: 0,
    explanation: "be 動詞の後には形容詞がきます。surprised「驚いた」が正しい形です。",
    japanese: "私はそのニュースを聞いて驚きました。"
  },
  {
    id: "eiken4-written-028",
    level: "英検4級",
    category: "vocabulary",
    question: "I need a ___ to carry my water.",
    choices: ["bottle", "chair", "window", "cloud"],
    answerIndex: 0,
    explanation: "水を運ぶ容器は bottle「ボトル」です。",
    japanese: "私は水を運ぶためにボトルが必要です。"
  },
  {
    id: "eiken4-written-029",
    level: "英検4級",
    category: "conversation",
    question: "A: Would you like some juice? B: ___",
    choices: ["No, thank you.", "I am twelve.", "She is kind.", "It is sunny."],
    answerIndex: 0,
    explanation: "Would you like ...? への断り方は No, thank you. です。",
    japanese: "A: ジュースはいかがですか。B: いいえ、結構です。"
  },
  {
    id: "eiken4-written-030",
    level: "英検4級",
    category: "writing",
    question: "Choose the best word: I was ___ in the math test.",
    choices: ["good", "well", "nice", "kind"],
    answerIndex: 0,
    explanation: "be 動詞の後には形容詞 good を使います。",
    japanese: "最もよい単語を選びなさい。私は数学のテストでよい出来でした。"
  },
  {
    id: "eiken4-written-031",
    level: "英検4級",
    category: "grammar",
    question: "My father comes home ___ seven every evening.",
    choices: ["at", "in", "on", "to"],
    answerIndex: 0,
    explanation: "時刻の前には at を使います。",
    japanese: "私の父は毎晩7時に家に帰ってきます。"
  },
  {
    id: "eiken4-written-032",
    level: "英検4級",
    category: "vocabulary",
    question: "The weather is very ___ today. Let's go for a walk.",
    choices: ["nice", "heavy", "sick", "short"],
    answerIndex: 0,
    explanation: "散歩に出かけたくなる天気は nice「良い」です。",
    japanese: "今日はとても良い天気です。散歩に行きましょう。"
  },
  {
    id: "eiken4-written-033",
    level: "英検4級",
    category: "phrase",
    question: "I can't wait ___ see the movie.",
    choices: ["to", "for", "at", "with"],
    answerIndex: 0,
    explanation: "can't wait to do で「〜するのが待ちきれない」という意味です。",
    japanese: "その映画を見るのが待ちきれません。"
  },
  {
    id: "eiken4-written-034",
    level: "英検4級",
    category: "grammar",
    question: "I ___ music when I do homework.",
    choices: ["listen to", "listen", "listening", "listened"],
    answerIndex: 0,
    explanation: "listen to ... で「〜を聴く」という意味です。",
    japanese: "私は宿題をするとき音楽を聴きます。"
  },
  {
    id: "eiken4-written-035",
    level: "英検4級",
    category: "vocabulary",
    question: "We ___ a lot of things at the market.",
    choices: ["bought", "read", "slept", "ran"],
    answerIndex: 0,
    explanation: "market「市場」では bought「買った」が合います。",
    japanese: "私たちは市場でたくさんのものを買いました。"
  },
  {
    id: "eiken4-written-036",
    level: "英検4級",
    category: "conversation",
    question: "A: What time do you wake up? B: ___",
    choices: ["At six o'clock.", "I am fine.", "It is cold.", "She is nice."],
    answerIndex: 0,
    explanation: "What time ...? には時刻を答えます。",
    japanese: "A: 何時に起きますか。B: 6時です。"
  },
  {
    id: "eiken4-written-037",
    level: "英検4級",
    category: "grammar",
    question: "She ___ her hair every morning.",
    choices: ["washes", "wash", "washing", "washed"],
    answerIndex: 0,
    explanation: "三人称単数 She には washes を使います。",
    japanese: "彼女は毎朝髪を洗います。"
  },
  {
    id: "eiken4-written-038",
    level: "英検4級",
    category: "vocabulary",
    question: "My uncle works at a ___. He repairs cars.",
    choices: ["garage", "library", "museum", "hospital"],
    answerIndex: 0,
    explanation: "車を修理する場所は garage「ガレージ」です。",
    japanese: "私のおじはガレージで働いています。車を修理します。"
  },
  {
    id: "eiken4-written-039",
    level: "英検4級",
    category: "phrase",
    question: "I am ___ to getting up early.",
    choices: ["used", "use", "using", "uses"],
    answerIndex: 0,
    explanation: "be used to ...ing で「〜することに慣れている」という意味です。",
    japanese: "私は早起きに慣れています。"
  },
  {
    id: "eiken4-written-040",
    level: "英検4級",
    category: "writing",
    question: "Choose the best sentence: My father ___ to work by train every day.",
    choices: ["goes", "go", "went", "going"],
    answerIndex: 0,
    explanation: "三人称単数 My father には goes を使います。",
    japanese: "最もよい文を選びなさい。私の父は毎日電車で仕事へ行きます。"
  },
  {
    id: "eiken4-written-041",
    level: "英検4級",
    category: "grammar",
    question: "I was ___ a book when my mother called me.",
    choices: ["reading", "read", "reads", "to read"],
    answerIndex: 0,
    explanation: "was + 動詞-ing で過去進行形を作ります。",
    japanese: "母が呼んだとき、私は本を読んでいました。"
  },
  {
    id: "eiken4-written-042",
    level: "英検4級",
    category: "vocabulary",
    question: "Can you ___ me where the post office is?",
    choices: ["tell", "speak", "talk", "say"],
    answerIndex: 0,
    explanation: "tell me ... で「〜を教えてください」という意味です。",
    japanese: "郵便局がどこにあるか教えてくれますか。"
  },
  {
    id: "eiken4-written-043",
    level: "英検4級",
    category: "conversation",
    question: "A: How do you go to school? B: ___",
    choices: ["By bicycle.", "I am fine.", "She has a cat.", "It is cold."],
    answerIndex: 0,
    explanation: "How do you go to ...? には交通手段を答えます。",
    japanese: "A: どうやって学校へ行きますか。B: 自転車で。"
  },
  {
    id: "eiken4-written-044",
    level: "英検4級",
    category: "grammar",
    question: "I have never ___ sushi.",
    choices: ["eaten", "eat", "ate", "eating"],
    answerIndex: 0,
    explanation: "have never + 過去分詞で「〜したことがない」という意味です。",
    japanese: "私はお寿司を食べたことがありません。"
  },
  {
    id: "eiken4-written-045",
    level: "英検4級",
    category: "vocabulary",
    question: "I need to ___ my homework before dinner.",
    choices: ["finish", "start", "break", "lose"],
    answerIndex: 0,
    explanation: "finish は「終わらせる」という意味です。",
    japanese: "私は夕食前に宿題を終わらせる必要があります。"
  },
  {
    id: "eiken4-written-046",
    level: "英検4級",
    category: "phrase",
    question: "The train will ___ at three o'clock.",
    choices: ["arrive", "goes", "leave", "come"],
    answerIndex: 0,
    explanation: "arrive は「到着する」という意味です。",
    japanese: "電車は3時に到着します。"
  },
  {
    id: "eiken4-written-047",
    level: "英検4級",
    category: "grammar",
    question: "I study English ___ Monday, Wednesday, and Friday.",
    choices: ["on", "at", "in", "to"],
    answerIndex: 0,
    explanation: "曜日の前には on を使います。",
    japanese: "私は月曜日、水曜日、金曜日に英語を勉強します。"
  },
  {
    id: "eiken4-written-048",
    level: "英検4級",
    category: "vocabulary",
    question: "My mother put the cake in the ___ to keep it cool.",
    choices: ["refrigerator", "classroom", "museum", "station"],
    answerIndex: 0,
    explanation: "cool「冷たく保つ」のは refrigerator「冷蔵庫」です。",
    japanese: "母はケーキを冷やすために冷蔵庫に入れました。"
  },
  {
    id: "eiken4-written-049",
    level: "英検4級",
    category: "conversation",
    question: "A: Can I use your phone? B: ___",
    choices: ["Sure, go ahead.", "I am hungry.", "It is green.", "She is kind."],
    answerIndex: 0,
    explanation: "Can I ...? への承諾は Sure, go ahead. 「どうぞ」です。",
    japanese: "A: あなたの電話を使っていいですか。B: もちろん、どうぞ。"
  },
  {
    id: "eiken4-written-050",
    level: "英検4級",
    category: "writing",
    question: "Choose the best word: We ___ a great time at the park.",
    choices: ["had", "have", "having", "has"],
    answerIndex: 0,
    explanation: "過去の出来事を表すので、have の過去形 had を使います。",
    japanese: "最もよい単語を選びなさい。私たちは公園でとても楽しかったです。"
  },
  {
    id: "eiken4-written-051",
    level: "英検4級",
    category: "grammar",
    question: "I ___ breakfast yet. I'm still hungry.",
    choices: ["haven't eaten", "ate", "eat", "eating"],
    answerIndex: 0,
    explanation: "yet と組み合わせた否定の現在完了は haven't + 過去分詞を使います。",
    japanese: "私はまだ朝食を食べていません。まだおなかがすいています。"
  },
  {
    id: "eiken4-written-052",
    level: "英検4級",
    category: "vocabulary",
    question: "The movie was so ___ that I cried.",
    choices: ["sad", "fast", "tall", "long"],
    answerIndex: 0,
    explanation: "泣くほど感動した映画を表すのは sad「悲しい」です。",
    japanese: "その映画はとても悲しくて、私は泣きました。"
  },
  {
    id: "eiken4-written-053",
    level: "英検4級",
    category: "phrase",
    question: "It ___ me one hour to get to school.",
    choices: ["takes", "go", "makes", "does"],
    answerIndex: 0,
    explanation: "It takes ... to do で「〜するのに…かかる」という意味です。",
    japanese: "学校まで行くのに1時間かかります。"
  },
  {
    id: "eiken4-written-054",
    level: "英検4級",
    category: "grammar",
    question: "I was ___ when I saw the snake.",
    choices: ["scared", "scare", "scaring", "scares"],
    answerIndex: 0,
    explanation: "be 動詞の後には形容詞 scared「怖かった」を使います。",
    japanese: "私はヘビを見たとき怖かったです。"
  },
  {
    id: "eiken4-written-055",
    level: "英検4級",
    category: "vocabulary",
    question: "Please ___ your hand if you have a question.",
    choices: ["raise", "run", "make", "take"],
    answerIndex: 0,
    explanation: "手を挙げることを raise「上げる」と言います。",
    japanese: "質問があれば手を挙げてください。"
  },
  {
    id: "eiken4-written-056",
    level: "英検4級",
    category: "conversation",
    question: "A: What's the weather like today? B: ___",
    choices: ["It's sunny and warm.", "I am fine.", "She is kind.", "He went home."],
    answerIndex: 0,
    explanation: "What's the weather like? には天気の状態を答えます。",
    japanese: "A: 今日の天気はどうですか。B: 晴れていて暖かいです。"
  },
  {
    id: "eiken4-written-057",
    level: "英検4級",
    category: "grammar",
    question: "I'll call you ___ I arrive.",
    choices: ["when", "until", "before", "or"],
    answerIndex: 0,
    explanation: "when は「〜したとき」という意味で時を表します。",
    japanese: "着いたら電話します。"
  },
  {
    id: "eiken4-written-058",
    level: "英検4級",
    category: "vocabulary",
    question: "The test was ___ than I expected.",
    choices: ["harder", "hard", "hardest", "hardly"],
    answerIndex: 0,
    explanation: "than があるので比較級 harder を使います。",
    japanese: "テストは思っていたより難しかったです。"
  },
  {
    id: "eiken4-written-059",
    level: "英検4級",
    category: "phrase",
    question: "___ sure to bring your lunch tomorrow.",
    choices: ["Be", "Make", "Do", "Have"],
    answerIndex: 0,
    explanation: "Be sure to do で「必ず〜しなさい」という意味です。",
    japanese: "明日は必ずお弁当を持ってきなさい。"
  },
  {
    id: "eiken4-written-060",
    level: "英検4級",
    category: "writing",
    question: "Choose the best sentence: I saw a ___ movie last Friday.",
    choices: ["exciting", "excitement", "excite", "excited"],
    answerIndex: 0,
    explanation: "名詞 movie を修飾する形容詞は exciting「わくわくする」です。",
    japanese: "最もよい文を選びなさい。先週の金曜日にわくわくする映画を見ました。"
  },
  {
    id: "eiken4-written-061",
    level: "英検4級",
    category: "grammar",
    question: "She ___ her bike to school every day.",
    choices: ["rides", "ride", "riding", "rode"],
    answerIndex: 0,
    explanation: "三人称単数 She には rides を使います。",
    japanese: "彼女は毎日自転車で学校へ行きます。"
  },
  {
    id: "eiken4-written-062",
    level: "英検4級",
    category: "vocabulary",
    question: "I want to be a ___ and design buildings.",
    choices: ["architect", "ticket", "cloud", "dinner"],
    answerIndex: 0,
    explanation: "建物を設計する職業は architect「建築家」です。",
    japanese: "私は建築家になって建物を設計したいです。"
  },
  {
    id: "eiken4-written-063",
    level: "英検4級",
    category: "conversation",
    question: "A: How long does it take to get to the station? B: ___",
    choices: ["About ten minutes.", "It is Monday.", "She likes dogs.", "I am fine."],
    answerIndex: 0,
    explanation: "How long does it take ...? には時間の長さを答えます。",
    japanese: "A: 駅まで何分かかりますか。B: 約10分です。"
  },
  {
    id: "eiken4-written-064",
    level: "英検4級",
    category: "grammar",
    question: "I ___ my room. It looks clean now.",
    choices: ["cleaned", "clean", "cleaning", "cleans"],
    answerIndex: 0,
    explanation: "きれいになったことを示す現在の結果には、過去形 cleaned が合います。",
    japanese: "私は部屋を掃除しました。今はきれいです。"
  },
  {
    id: "eiken4-written-065",
    level: "英検4級",
    category: "vocabulary",
    question: "My sister has long ___ hair.",
    choices: ["black", "fast", "loud", "short"],
    answerIndex: 0,
    explanation: "hair「髪」の色を表すのは black「黒い」が自然です。",
    japanese: "私の姉は長い黒髪をしています。"
  },
  {
    id: "eiken4-written-066",
    level: "英検4級",
    category: "phrase",
    question: "I look ___ to my summer vacation.",
    choices: ["forward", "up", "down", "back"],
    answerIndex: 0,
    explanation: "look forward to ...で「〜を楽しみにする」という意味です。",
    japanese: "私は夏休みを楽しみにしています。"
  },
  {
    id: "eiken4-written-067",
    level: "英検4級",
    category: "grammar",
    question: "I could ___ when I was five years old.",
    choices: ["swim", "swimming", "swam", "swims"],
    answerIndex: 0,
    explanation: "could の後には動詞の原形を使います。",
    japanese: "私は5歳のときに泳げました。"
  },
  {
    id: "eiken4-written-068",
    level: "英検4級",
    category: "vocabulary",
    question: "This jacket is ___ cheap. I'll buy it.",
    choices: ["very", "more", "most", "too"],
    answerIndex: 0,
    explanation: "very は「とても」という意味で形容詞を強調します。",
    japanese: "このジャケットはとても安いです。買います。"
  },
  {
    id: "eiken4-written-069",
    level: "英検4級",
    category: "conversation",
    question: "A: Whose notebook is this? B: ___",
    choices: ["It's mine.", "I am happy.", "She is tall.", "He goes home."],
    answerIndex: 0,
    explanation: "Whose ...? には所有者を答えます。",
    japanese: "A: これは誰のノートですか。B: 私のです。"
  },
  {
    id: "eiken4-written-070",
    level: "英検4級",
    category: "writing",
    question: "Choose the best word: I ___ English every night before bed.",
    choices: ["study", "studies", "studied", "studying"],
    answerIndex: 0,
    explanation: "主語 I には動詞の原形 study を使います。",
    japanese: "最もよい単語を選びなさい。私は毎晩寝る前に英語を勉強します。"
  },
  {
    id: "eiken4-written-071",
    level: "英検4級",
    category: "grammar",
    question: "I will help you ___ you need me.",
    choices: ["if", "but", "so", "or"],
    answerIndex: 0,
    explanation: "if は「もし〜なら」という条件を表します。",
    japanese: "必要なら手伝います。"
  },
  {
    id: "eiken4-written-072",
    level: "英検4級",
    category: "vocabulary",
    question: "I am very ___ of my team. We won the game.",
    choices: ["proud", "tired", "sad", "bored"],
    answerIndex: 0,
    explanation: "be proud of ... で「〜を誇りに思う」という意味です。",
    japanese: "私はチームをとても誇りに思います。試合に勝ちました。"
  },
  {
    id: "eiken4-written-073",
    level: "英検4級",
    category: "phrase",
    question: "He is ___ at cooking. He helps his mother.",
    choices: ["good", "nice", "kind", "tall"],
    answerIndex: 0,
    explanation: "be good at ...ing で「〜するのが得意だ」という意味です。",
    japanese: "彼は料理が得意です。お母さんを手伝います。"
  },
  {
    id: "eiken4-written-074",
    level: "英検4級",
    category: "grammar",
    question: "I ___ my friend yesterday. We talked for a long time.",
    choices: ["met", "meet", "meets", "meeting"],
    answerIndex: 0,
    explanation: "yesterday という過去の時があるので、meet の過去形 met を使います。",
    japanese: "私は昨日友達に会いました。長い時間話しました。"
  },
  {
    id: "eiken4-written-075",
    level: "英検4級",
    category: "vocabulary",
    question: "The food in that restaurant is very ___ but expensive.",
    choices: ["delicious", "cold", "short", "fast"],
    answerIndex: 0,
    explanation: "食べ物が but expensive「でも高い」につながるのは delicious「おいしい」です。",
    japanese: "あのレストランの料理はとてもおいしいですが、高いです。"
  },
  {
    id: "eiken4-written-076",
    level: "英検4級",
    category: "conversation",
    question: "A: What's your hobby? B: ___",
    choices: ["I like drawing pictures.", "I am twelve.", "She is kind.", "It is blue."],
    answerIndex: 0,
    explanation: "What's your hobby? には趣味を答えます。",
    japanese: "A: 趣味は何ですか。B: 絵を描くことが好きです。"
  },
  {
    id: "eiken4-written-077",
    level: "英検4級",
    category: "grammar",
    question: "I am going ___ watch a movie tonight.",
    choices: ["to", "for", "at", "in"],
    answerIndex: 0,
    explanation: "be going to do で「〜するつもりだ」という意味です。",
    japanese: "私は今夜映画を見るつもりです。"
  },
  {
    id: "eiken4-written-078",
    level: "英検4級",
    category: "vocabulary",
    question: "My grandmother often sends me ___ by mail.",
    choices: ["letters", "fast", "long", "cold"],
    answerIndex: 0,
    explanation: "mail「郵便」で送るものは letters「手紙」です。",
    japanese: "私の祖母はよく手紙を郵便で送ってくれます。"
  },
  {
    id: "eiken4-written-079",
    level: "英検4級",
    category: "phrase",
    question: "What ___ of music do you like?",
    choices: ["kind", "way", "time", "day"],
    answerIndex: 0,
    explanation: "what kind of ... で「どんな種類の〜」という意味です。",
    japanese: "どんな種類の音楽が好きですか。"
  },
  {
    id: "eiken4-written-080",
    level: "英検4級",
    category: "writing",
    question: "Choose the best sentence: The bag is ___ than the box.",
    choices: ["bigger", "big", "biggest", "more big"],
    answerIndex: 0,
    explanation: "than がある比較では比較級 bigger を使います。",
    japanese: "最もよい文を選びなさい。かばんは箱より大きいです。"
  },
  {
    id: "eiken4-written-081",
    level: "英検4級",
    category: "grammar",
    question: "I want ___ be a soccer player.",
    choices: ["to", "for", "at", "with"],
    answerIndex: 0,
    explanation: "want to do で「〜したい」という意味です。",
    japanese: "私はサッカー選手になりたいです。"
  },
  {
    id: "eiken4-written-082",
    level: "英検4級",
    category: "vocabulary",
    question: "I got a ___ on my English test. I am so happy.",
    choices: ["perfect score", "cold day", "fast run", "long book"],
    answerIndex: 0,
    explanation: "英語のテストで得た嬉しいものは perfect score「満点」です。",
    japanese: "英語のテストで満点を取りました。とてもうれしいです。"
  },
  {
    id: "eiken4-written-083",
    level: "英検4級",
    category: "conversation",
    question: "A: What do you want for dinner? B: ___",
    choices: ["I want pizza.", "I am fine.", "It is blue.", "She is tall."],
    answerIndex: 0,
    explanation: "What do you want for dinner? には食べたいものを答えます。",
    japanese: "A: 夕食に何が食べたいですか。B: ピザが食べたいです。"
  },
  {
    id: "eiken4-written-084",
    level: "英検4級",
    category: "grammar",
    question: "My brother is ___ than me.",
    choices: ["taller", "tall", "tallest", "more tall"],
    answerIndex: 0,
    explanation: "than があるので比較級 taller を使います。",
    japanese: "私の兄は私より背が高いです。"
  },
  {
    id: "eiken4-written-085",
    level: "英検4級",
    category: "vocabulary",
    question: "I need to ___ some groceries for tonight's dinner.",
    choices: ["buy", "read", "sleep", "run"],
    answerIndex: 0,
    explanation: "groceries「食料品」に使う動詞は buy「買う」です。",
    japanese: "今夜の夕食のために食料品を買う必要があります。"
  },
  {
    id: "eiken4-written-086",
    level: "英検4級",
    category: "phrase",
    question: "Please ___ care of yourself.",
    choices: ["take", "make", "do", "give"],
    answerIndex: 0,
    explanation: "take care of ... で「〜の世話をする、〜に気をつける」という意味です。",
    japanese: "体に気をつけてください。"
  },
  {
    id: "eiken4-written-087",
    level: "英検4級",
    category: "grammar",
    question: "I don't know ___ she is from.",
    choices: ["where", "what", "when", "who"],
    answerIndex: 0,
    explanation: "出身地を表す内容には where を使います。",
    japanese: "私は彼女がどこの出身なのか知りません。"
  },
  {
    id: "eiken4-written-088",
    level: "英検4級",
    category: "vocabulary",
    question: "She felt very ___ after she failed the exam.",
    choices: ["disappointed", "happy", "excited", "hungry"],
    answerIndex: 0,
    explanation: "試験に落ちた後の気持ちは disappointed「がっかりした」です。",
    japanese: "彼女は試験に落ちてとてもがっかりしました。"
  },
  {
    id: "eiken4-written-089",
    level: "英検4級",
    category: "conversation",
    question: "A: I forgot my umbrella today. B: ___",
    choices: ["That's too bad.", "I am twelve.", "She is nice.", "It is sunny."],
    answerIndex: 0,
    explanation: "残念な知らせを聞いたときは That's too bad. 「それは残念ですね」と言います。",
    japanese: "A: 今日傘を忘れました。B: それは残念ですね。"
  },
  {
    id: "eiken4-written-090",
    level: "英検4級",
    category: "writing",
    question: "Choose the best sentence: Ken plays the guitar ___ in his band.",
    choices: ["well", "good", "nice", "fine"],
    answerIndex: 0,
    explanation: "動詞 plays を修飾するには副詞 well を使います。",
    japanese: "最もよい文を選びなさい。ケンはバンドでギターを上手に弾きます。"
  },
  {
    id: "eiken4-written-091",
    level: "英検4級",
    category: "grammar",
    question: "I ___ to the concert last Saturday.",
    choices: ["went", "go", "going", "goes"],
    answerIndex: 0,
    explanation: "last Saturday という過去の時があるので、過去形 went を使います。",
    japanese: "私は先週の土曜日にコンサートへ行きました。"
  },
  {
    id: "eiken4-written-092",
    level: "英検4級",
    category: "vocabulary",
    question: "My mother always ___ me when I am sad.",
    choices: ["cheers up", "runs away", "falls down", "looks up"],
    answerIndex: 0,
    explanation: "cheer up は「元気づける」という意味です。",
    japanese: "私が悲しいとき、母はいつも元気づけてくれます。"
  },
  {
    id: "eiken4-written-093",
    level: "英検4級",
    category: "phrase",
    question: "We had ___ fun at the beach.",
    choices: ["so much", "very", "too", "many"],
    answerIndex: 0,
    explanation: "so much fun で「とても楽しい」という意味です。",
    japanese: "私たちはビーチでとても楽しかったです。"
  },
  {
    id: "eiken4-written-094",
    level: "英検4級",
    category: "grammar",
    question: "She ___ cooking when her friend arrived.",
    choices: ["was", "is", "were", "has"],
    answerIndex: 0,
    explanation: "過去進行形は was/were + -ing で表します。She には was を使います。",
    japanese: "友達が来たとき、彼女は料理をしていました。"
  },
  {
    id: "eiken4-written-095",
    level: "英検4級",
    category: "vocabulary",
    question: "I want to improve my ___ in swimming.",
    choices: ["skills", "cold", "fast", "tall"],
    answerIndex: 0,
    explanation: "improve「向上させる」に合う名詞は skills「技術」です。",
    japanese: "私は水泳の技術を向上させたいです。"
  },
  {
    id: "eiken4-written-096",
    level: "英検4級",
    category: "conversation",
    question: "A: Are you ready for the test? B: ___",
    choices: ["I think so.", "She is tall.", "It is cold.", "I am twelve."],
    answerIndex: 0,
    explanation: "Are you ready? には I think so. 「そう思います」と答えられます。",
    japanese: "A: テストの準備はできていますか。B: そう思います。"
  },
  {
    id: "eiken4-written-097",
    level: "英検4級",
    category: "grammar",
    question: "I ___ to go to the bathroom.",
    choices: ["need", "needs", "needing", "needed"],
    answerIndex: 0,
    explanation: "主語 I には need（原形）を使います。",
    japanese: "私はトイレに行く必要があります。"
  },
  {
    id: "eiken4-written-098",
    level: "英検4級",
    category: "vocabulary",
    question: "My family had a barbecue in our ___.",
    choices: ["garden", "bottle", "dream", "ticket"],
    answerIndex: 0,
    explanation: "バーベキューをする場所は garden「庭」です。",
    japanese: "私の家族は庭でバーベキューをしました。"
  },
  {
    id: "eiken4-written-099",
    level: "英検4級",
    category: "phrase",
    question: "Please ___ in line.",
    choices: ["wait", "go", "run", "eat"],
    answerIndex: 0,
    explanation: "wait in line で「列に並んで待つ」という意味です。",
    japanese: "列に並んでお待ちください。"
  },
  {
    id: "eiken4-written-100",
    level: "英検4級",
    category: "writing",
    question: "Choose the best sentence: I will ___ my best in the next exam.",
    choices: ["do", "make", "take", "have"],
    answerIndex: 0,
    explanation: "do my best で「全力を尽くす」という意味です。",
    japanese: "最もよい文を選びなさい。次の試験でベストを尽くします。"
  }
];

export default eiken4Written001_100;
