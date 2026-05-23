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

export const eikenPre2Written001_100: WrittenQuestion[] = [
  {
    id: "eiken-pre2-written-001",
    level: "英検準2級",
    category: "grammar",
    question: "If I ___ more time, I would travel the world.",
    choices: ["had", "have", "has", "having"],
    answerIndex: 0,
    explanation: "仮定法過去では if の節に動詞の過去形を使います。",
    japanese: "もし時間がもっとあれば、世界を旅するのに。"
  },
  {
    id: "eiken-pre2-written-002",
    level: "英検準2級",
    category: "vocabulary",
    question: "The scientist made an important ___ that changed medicine.",
    choices: ["discovery", "direction", "distance", "dictionary"],
    answerIndex: 0,
    explanation: "change「変える」目的語として discovery「発見」が合います。",
    japanese: "その科学者は医学を変える重要な発見をしました。"
  },
  {
    id: "eiken-pre2-written-003",
    level: "英検準2級",
    category: "conversation",
    question: "A: Have you decided on a career? B: ___",
    choices: ["I'm thinking of becoming a teacher.", "It is blue.", "She is kind.", "I went home."],
    answerIndex: 0,
    explanation: "career「職業・進路」について I'm thinking of doing ... と答えるのが自然です。",
    japanese: "A: 進路は決まりましたか。B: 先生になろうと考えています。"
  },
  {
    id: "eiken-pre2-written-004",
    level: "英検準2級",
    category: "grammar",
    question: "The problem ___ by the team before the deadline.",
    choices: ["was solved", "solved", "is solving", "solve"],
    answerIndex: 0,
    explanation: "過去の受け身は was/were + 過去分詞で表します。",
    japanese: "問題は締め切り前にチームによって解決されました。"
  },
  {
    id: "eiken-pre2-written-005",
    level: "英検準2級",
    category: "vocabulary",
    question: "She is very ___ about learning new languages.",
    choices: ["enthusiastic", "difficult", "expensive", "dangerous"],
    answerIndex: 0,
    explanation: "be enthusiastic about ... で「〜に熱心な」という意味です。",
    japanese: "彼女は新しい言語を学ぶことにとても熱心です。"
  },
  {
    id: "eiken-pre2-written-006",
    level: "英検準2級",
    category: "phrase",
    question: "He ___ advantage of the chance to study abroad.",
    choices: ["took", "made", "got", "did"],
    answerIndex: 0,
    explanation: "take advantage of ... で「〜を利用する」という意味です。",
    japanese: "彼は留学するチャンスを利用しました。"
  },
  {
    id: "eiken-pre2-written-007",
    level: "英検準2級",
    category: "grammar",
    question: "She has been studying English ___ she was eight.",
    choices: ["since", "for", "during", "while"],
    answerIndex: 0,
    explanation: "since は始まりの時点を表し、現在完了と一緒に使います。",
    japanese: "彼女は8歳のときから英語を勉強し続けています。"
  },
  {
    id: "eiken-pre2-written-008",
    level: "英検準2級",
    category: "vocabulary",
    question: "The new policy will ___ the way we work.",
    choices: ["affect", "accept", "afford", "achieve"],
    answerIndex: 0,
    explanation: "affect は「〜に影響を与える」という意味です。",
    japanese: "新しい方針は私たちの仕事の仕方に影響を与えます。"
  },
  {
    id: "eiken-pre2-written-009",
    level: "英検準2級",
    category: "conversation",
    question: "A: What do you think about climate change? B: ___",
    choices: ["It's a serious global problem.", "I am hungry.", "She is nice.", "He went home."],
    answerIndex: 0,
    explanation: "What do you think about ...? には意見を述べます。",
    japanese: "A: 気候変動についてどう思いますか。B: 深刻な世界的問題だと思います。"
  },
  {
    id: "eiken-pre2-written-010",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best sentence: ___ in mind that the deadline is next Friday.",
    choices: ["Keep", "Make", "Have", "Take"],
    answerIndex: 0,
    explanation: "Keep in mind that ... で「〜を覚えておく」という意味です。",
    japanese: "最もよい文を選びなさい。締め切りが来週の金曜日であることを覚えておいてください。"
  },
  {
    id: "eiken-pre2-written-011",
    level: "英検準2級",
    category: "grammar",
    question: "By the time she arrived, everyone ___ left.",
    choices: ["had", "has", "have", "was"],
    answerIndex: 0,
    explanation: "過去のある時点までに完了した動作には過去完了（had + 過去分詞）を使います。",
    japanese: "彼女が到着したとき、全員がすでに帰っていました。"
  },
  {
    id: "eiken-pre2-written-012",
    level: "英検準2級",
    category: "vocabulary",
    question: "We need to ___ our efforts to protect the environment.",
    choices: ["increase", "include", "ignore", "inform"],
    answerIndex: 0,
    explanation: "efforts「努力」に合う動詞は increase「増やす」です。",
    japanese: "私たちは環境保護の努力を増やす必要があります。"
  },
  {
    id: "eiken-pre2-written-013",
    level: "英検準2級",
    category: "phrase",
    question: "The students ___ use of the internet to do research.",
    choices: ["made", "took", "did", "got"],
    answerIndex: 0,
    explanation: "make use of ... で「〜を利用する」という意味です。",
    japanese: "生徒たちはリサーチをするためにインターネットを利用しました。"
  },
  {
    id: "eiken-pre2-written-014",
    level: "英検準2級",
    category: "grammar",
    question: "She was ___ tired that she fell asleep on the train.",
    choices: ["so", "too", "very", "such"],
    answerIndex: 0,
    explanation: "so ... that で「とても〜なので…」という意味です。",
    japanese: "彼女はとても疲れていたので、電車の中で眠ってしまいました。"
  },
  {
    id: "eiken-pre2-written-015",
    level: "英検準2級",
    category: "vocabulary",
    question: "The concert was ___, and the audience cheered loudly.",
    choices: ["magnificent", "boring", "dangerous", "ordinary"],
    answerIndex: 0,
    explanation: "観客が歓声を上げる演奏会には magnificent「壮大な」が合います。",
    japanese: "コンサートは壮大で、観客は大声で歓声を上げました。"
  },
  {
    id: "eiken-pre2-written-016",
    level: "英検準2級",
    category: "conversation",
    question: "A: I'm thinking of studying abroad. B: ___",
    choices: ["That sounds exciting! Where are you planning to go?", "I am fine.", "She is nice.", "It is cold."],
    answerIndex: 0,
    explanation: "留学を考えている相手への自然な返事は関心と質問を示すものです。",
    japanese: "A: 留学を考えています。B: それはわくわきしますね！どこに行く予定ですか。"
  },
  {
    id: "eiken-pre2-written-017",
    level: "英検準2級",
    category: "grammar",
    question: "The report must be ___ by tomorrow morning.",
    choices: ["submitted", "submit", "submitting", "submits"],
    answerIndex: 0,
    explanation: "must be + 過去分詞で受け身の義務を表します。",
    japanese: "レポートは明日の朝までに提出されなければなりません。"
  },
  {
    id: "eiken-pre2-written-018",
    level: "英検準2級",
    category: "vocabulary",
    question: "The government decided to ___ a new law to protect children.",
    choices: ["introduce", "ignore", "increase", "involve"],
    answerIndex: 0,
    explanation: "introduce a law で「法律を導入する」という意味です。",
    japanese: "政府は子どもを守るために新しい法律を導入することを決めました。"
  },
  {
    id: "eiken-pre2-written-019",
    level: "英検準2級",
    category: "phrase",
    question: "I came ___ with a good idea for the project.",
    choices: ["up", "out", "in", "on"],
    answerIndex: 0,
    explanation: "come up with ... で「〜を思いつく」という意味です。",
    japanese: "私はプロジェクトのためのよいアイデアを思いつきました。"
  },
  {
    id: "eiken-pre2-written-020",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best sentence: She was ___ in learning about the history of Japan.",
    choices: ["interested", "interesting", "interest", "interests"],
    answerIndex: 0,
    explanation: "be interested in ... で「〜に興味がある」という意味です。",
    japanese: "最もよい文を選びなさい。彼女は日本の歴史を学ぶことに興味がありました。"
  },
  {
    id: "eiken-pre2-written-021",
    level: "英検準2級",
    category: "grammar",
    question: "The number of students ___ every year in this school.",
    choices: ["increases", "increase", "increasing", "increased"],
    answerIndex: 0,
    explanation: "主語が The number of ... の場合、動詞は単数扱いで increases を使います。",
    japanese: "この学校の生徒数は毎年増加しています。"
  },
  {
    id: "eiken-pre2-written-022",
    level: "英検準2級",
    category: "vocabulary",
    question: "His speech ___ a deep impression on the audience.",
    choices: ["made", "gave", "did", "had"],
    answerIndex: 0,
    explanation: "make an impression on ... で「〜に印象を与える」という意味です。",
    japanese: "彼のスピーチは観客に深い印象を与えました。"
  },
  {
    id: "eiken-pre2-written-023",
    level: "英検準2級",
    category: "conversation",
    question: "A: How was your experience volunteering? B: ___",
    choices: ["It was very rewarding.", "I am twelve.", "She is tall.", "It is blue."],
    answerIndex: 0,
    explanation: "How was your experience ...? には感想を答えます。",
    japanese: "A: ボランティアの経験はどうでしたか。B: とてもやりがいがありました。"
  },
  {
    id: "eiken-pre2-written-024",
    level: "英検準2級",
    category: "grammar",
    question: "She wishes she ___ play the violin.",
    choices: ["could", "can", "will", "would"],
    answerIndex: 0,
    explanation: "wish に続く節は仮定法過去を使い、could を使います。",
    japanese: "彼女はバイオリンを弾けたらいいのにと思っています。"
  },
  {
    id: "eiken-pre2-written-025",
    level: "英検準2級",
    category: "vocabulary",
    question: "It is ___ to check the weather before going on a trip.",
    choices: ["advisable", "available", "acceptable", "attractive"],
    answerIndex: 0,
    explanation: "It is advisable to do ... で「〜することが望ましい」という意味です。",
    japanese: "旅行に出かける前に天気を確認することが望ましいです。"
  },
  {
    id: "eiken-pre2-written-026",
    level: "英検準2級",
    category: "phrase",
    question: "His plan didn't work out, but he didn't give ___.",
    choices: ["up", "in", "out", "off"],
    answerIndex: 0,
    explanation: "give up で「あきらめる」という意味です。",
    japanese: "彼の計画はうまくいきませんでしたが、彼はあきらめませんでした。"
  },
  {
    id: "eiken-pre2-written-027",
    level: "英検準2級",
    category: "grammar",
    question: "Not only students ___ teachers were surprised by the announcement.",
    choices: ["but also", "and", "so that", "because"],
    answerIndex: 0,
    explanation: "not only A but also B で「AだけでなくBも」という意味です。",
    japanese: "生徒だけでなく先生も、そのお知らせに驚きました。"
  },
  {
    id: "eiken-pre2-written-028",
    level: "英検準2級",
    category: "vocabulary",
    question: "The old building was ___ into a modern museum.",
    choices: ["converted", "confused", "controlled", "continued"],
    answerIndex: 0,
    explanation: "be converted into ... で「〜に改築される」という意味です。",
    japanese: "その古い建物は現代的な博物館に改築されました。"
  },
  {
    id: "eiken-pre2-written-029",
    level: "英検準2級",
    category: "conversation",
    question: "A: What's the most important thing for a healthy lifestyle? B: ___",
    choices: ["I think regular exercise and a balanced diet are key.", "I am fine.", "She is tall.", "It is cold."],
    answerIndex: 0,
    explanation: "What's the most important thing ...? には自分の考えを述べます。",
    japanese: "A: 健康的な生活スタイルで最も大切なことは何ですか。B: 定期的な運動とバランスのよい食事が重要だと思います。"
  },
  {
    id: "eiken-pre2-written-030",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best word: Despite the rain, the festival was held ___ schedule.",
    choices: ["on", "at", "in", "for"],
    answerIndex: 0,
    explanation: "on schedule で「予定通りに」という意味です。",
    japanese: "最もよい単語を選びなさい。雨にもかかわらず、フェスティバルは予定通りに開催されました。"
  },
  {
    id: "eiken-pre2-written-031",
    level: "英検準2級",
    category: "grammar",
    question: "He asked me ___ I had finished the project.",
    choices: ["whether", "what", "who", "where"],
    answerIndex: 0,
    explanation: "whether は「〜かどうか」という意味の接続詞です。",
    japanese: "彼は私がプロジェクトを終えたかどうかたずねました。"
  },
  {
    id: "eiken-pre2-written-032",
    level: "英検準2級",
    category: "vocabulary",
    question: "The medicine was ___ for treating the disease.",
    choices: ["effective", "expensive", "exhausted", "exciting"],
    answerIndex: 0,
    explanation: "be effective for ... で「〜に効果的な」という意味です。",
    japanese: "その薬はその病気を治すのに効果的でした。"
  },
  {
    id: "eiken-pre2-written-033",
    level: "英検準2級",
    category: "phrase",
    question: "We ran ___ of time before we could finish the exam.",
    choices: ["out", "up", "away", "off"],
    answerIndex: 0,
    explanation: "run out of ... で「〜がなくなる、尽きる」という意味です。",
    japanese: "私たちは試験を終える前に時間が足りなくなりました。"
  },
  {
    id: "eiken-pre2-written-034",
    level: "英検準2級",
    category: "grammar",
    question: "The teacher suggested ___ more books to improve my writing.",
    choices: ["reading", "read", "to read", "reads"],
    answerIndex: 0,
    explanation: "suggest + 動名詞で「〜することを提案する」という意味です。",
    japanese: "先生は文章力を高めるためにもっと本を読むことを勧めました。"
  },
  {
    id: "eiken-pre2-written-035",
    level: "英検準2級",
    category: "vocabulary",
    question: "Her ___ personality made everyone feel welcome.",
    choices: ["warm", "fast", "long", "cold"],
    answerIndex: 0,
    explanation: "皆が歓迎されたと感じさせる性格は warm「温かい」です。",
    japanese: "彼女の温かい性格は皆に歓迎されていると感じさせました。"
  },
  {
    id: "eiken-pre2-written-036",
    level: "英検準2級",
    category: "conversation",
    question: "A: I'm nervous about my presentation tomorrow. B: ___",
    choices: ["I'm sure you'll do great!", "It is blue.", "She is tall.", "I am fine."],
    answerIndex: 0,
    explanation: "緊張している相手を励ます返事が自然です。",
    japanese: "A: 明日のプレゼンが緊張します。B: きっとうまくいきますよ！"
  },
  {
    id: "eiken-pre2-written-037",
    level: "英検準2級",
    category: "grammar",
    question: "She is the most talented student ___ I have ever taught.",
    choices: ["that", "who", "which", "what"],
    answerIndex: 0,
    explanation: "最上級の後の関係代名詞には that を使います。",
    japanese: "彼女は私が今まで教えた中で最も才能のある生徒です。"
  },
  {
    id: "eiken-pre2-written-038",
    level: "英検準2級",
    category: "vocabulary",
    question: "The research showed that sleep is ___ for good health.",
    choices: ["essential", "optional", "difficult", "unusual"],
    answerIndex: 0,
    explanation: "be essential for ... で「〜に欠かせない」という意味です。",
    japanese: "その研究は、睡眠が健康に欠かせないことを示しました。"
  },
  {
    id: "eiken-pre2-written-039",
    level: "英検準2級",
    category: "phrase",
    question: "He ___ into account the opinions of his team members.",
    choices: ["took", "made", "got", "kept"],
    answerIndex: 0,
    explanation: "take into account で「〜を考慮する」という意味です。",
    japanese: "彼はチームメンバーの意見を考慮しました。"
  },
  {
    id: "eiken-pre2-written-040",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best sentence: The results were ___ than anyone had expected.",
    choices: ["better", "best", "good", "well"],
    answerIndex: 0,
    explanation: "than があるので比較級 better を使います。",
    japanese: "最もよい文を選びなさい。結果は誰もが予想していたより良かったです。"
  },
  {
    id: "eiken-pre2-written-041",
    level: "英検準2級",
    category: "grammar",
    question: "I would rather ___ home than go out tonight.",
    choices: ["stay", "staying", "stayed", "to stay"],
    answerIndex: 0,
    explanation: "would rather + 動詞原形 で「むしろ〜したい」という意味です。",
    japanese: "私は今夜外出するよりも家にいたいです。"
  },
  {
    id: "eiken-pre2-written-042",
    level: "英検準2級",
    category: "vocabulary",
    question: "The new bridge will ___ two parts of the city.",
    choices: ["connect", "collect", "correct", "control"],
    answerIndex: 0,
    explanation: "connect は「〜をつなぐ」という意味です。",
    japanese: "新しい橋は街の2つの地区をつなぎます。"
  },
  {
    id: "eiken-pre2-written-043",
    level: "英検準2級",
    category: "conversation",
    question: "A: Why do you want to work for this company? B: ___",
    choices: ["Because I admire its work in environmental protection.", "I am fine.", "It is cold.", "She is tall."],
    answerIndex: 0,
    explanation: "Why do you want to ...? には理由を述べます。",
    japanese: "A: なぜこの会社で働きたいのですか。B: 環境保護の取り組みに感銘を受けているからです。"
  },
  {
    id: "eiken-pre2-written-044",
    level: "英検準2級",
    category: "grammar",
    question: "The more you practice, ___ you will become.",
    choices: ["the better", "the best", "better", "best"],
    answerIndex: 0,
    explanation: "The + 比較級, the + 比較級 で「〜すればするほど、さらに〜」という意味です。",
    japanese: "練習すればするほど、上手になります。"
  },
  {
    id: "eiken-pre2-written-045",
    level: "英検準2級",
    category: "vocabulary",
    question: "The company plans to ___ a new product next spring.",
    choices: ["launch", "leave", "limit", "link"],
    answerIndex: 0,
    explanation: "launch は「〜を発売する」という意味です。",
    japanese: "その会社は来春に新製品を発売する予定です。"
  },
  {
    id: "eiken-pre2-written-046",
    level: "英検準2級",
    category: "phrase",
    question: "She managed to ___ on top of her studies and part-time job.",
    choices: ["keep", "do", "have", "take"],
    answerIndex: 0,
    explanation: "keep on top of ... で「〜をうまくこなし続ける」という意味です。",
    japanese: "彼女は勉強とアルバイトをうまくこなし続けました。"
  },
  {
    id: "eiken-pre2-written-047",
    level: "英検準2級",
    category: "grammar",
    question: "The book ___ I read last month was very helpful.",
    choices: ["that", "who", "where", "when"],
    answerIndex: 0,
    explanation: "物を修飾する関係代名詞には that または which を使います。",
    japanese: "先月読んだ本はとても役に立ちました。"
  },
  {
    id: "eiken-pre2-written-048",
    level: "英検準2級",
    category: "vocabulary",
    question: "She was ___ by the complexity of the math problem.",
    choices: ["overwhelmed", "overjoyed", "overcome", "overworked"],
    answerIndex: 0,
    explanation: "be overwhelmed by ... で「〜に圧倒される」という意味です。",
    japanese: "彼女は数学の問題の複雑さに圧倒されました。"
  },
  {
    id: "eiken-pre2-written-049",
    level: "英検準2級",
    category: "conversation",
    question: "A: What are the advantages of living in the city? B: ___",
    choices: ["There are more job opportunities and convenient transportation.", "I am fine.", "It is cold.", "She is tall."],
    answerIndex: 0,
    explanation: "What are the advantages of ...? には具体的なメリットを述べます。",
    japanese: "A: 都市に住むことの利点は何ですか。B: より多くの就職の機会と便利な交通機関があります。"
  },
  {
    id: "eiken-pre2-written-050",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best sentence: It is important ___ both sides of an argument before deciding.",
    choices: ["to consider", "consider", "considering", "considered"],
    answerIndex: 0,
    explanation: "It is important to do で「〜することが大切だ」という意味です。",
    japanese: "最もよい文を選びなさい。決める前に議論の両面を考慮することが大切です。"
  },
  {
    id: "eiken-pre2-written-051",
    level: "英検準2級",
    category: "grammar",
    question: "I have been waiting ___ two hours.",
    choices: ["for", "since", "during", "while"],
    answerIndex: 0,
    explanation: "期間（two hours）の前には for を使います。",
    japanese: "私は2時間待っています。"
  },
  {
    id: "eiken-pre2-written-052",
    level: "英検準2級",
    category: "vocabulary",
    question: "She showed great ___ in solving the difficult problem.",
    choices: ["creativity", "danger", "distance", "direction"],
    answerIndex: 0,
    explanation: "難問を解くときに発揮するのは creativity「創造性」です。",
    japanese: "彼女は難しい問題を解くのに大きな創造性を見せました。"
  },
  {
    id: "eiken-pre2-written-053",
    level: "英検準2級",
    category: "phrase",
    question: "The meeting was ___ off until next week.",
    choices: ["put", "took", "kept", "held"],
    answerIndex: 0,
    explanation: "put off で「〜を延期する」という意味です。",
    japanese: "会議は来週まで延期されました。"
  },
  {
    id: "eiken-pre2-written-054",
    level: "英検準2級",
    category: "grammar",
    question: "She told me that she ___ studying at that time.",
    choices: ["was", "is", "has", "had"],
    answerIndex: 0,
    explanation: "間接話法で過去の進行中の動作を表すには was を使います。",
    japanese: "彼女はそのとき勉強中だったと私に言いました。"
  },
  {
    id: "eiken-pre2-written-055",
    level: "英検準2級",
    category: "vocabulary",
    question: "The organization aims to ___ poverty in developing countries.",
    choices: ["reduce", "refuse", "remove", "remain"],
    answerIndex: 0,
    explanation: "poverty「貧困」に合う動詞は reduce「減らす」です。",
    japanese: "その組織は発展途上国の貧困を減らすことを目指しています。"
  },
  {
    id: "eiken-pre2-written-056",
    level: "英検準2級",
    category: "conversation",
    question: "A: How do you deal with stress? B: ___",
    choices: ["I usually go for a run or talk to a friend.", "I am fine.", "She is tall.", "It is cold."],
    answerIndex: 0,
    explanation: "How do you deal with ...? には対処法を答えます。",
    japanese: "A: ストレスにどう対処しますか。B: たいていジョギングをするか、友達に話します。"
  },
  {
    id: "eiken-pre2-written-057",
    level: "英検準2級",
    category: "grammar",
    question: "It ___ that regular exercise is good for mental health.",
    choices: ["is said", "says", "is saying", "said"],
    answerIndex: 0,
    explanation: "It is said that ... で「〜と言われている」という意味です。",
    japanese: "定期的な運動は精神的健康に良いと言われています。"
  },
  {
    id: "eiken-pre2-written-058",
    level: "英検準2級",
    category: "vocabulary",
    question: "The government needs to ___ stricter regulations on air pollution.",
    choices: ["enforce", "ignore", "avoid", "escape"],
    answerIndex: 0,
    explanation: "enforce regulations で「規制を実施する」という意味です。",
    japanese: "政府は大気汚染に対してより厳しい規制を実施する必要があります。"
  },
  {
    id: "eiken-pre2-written-059",
    level: "英検準2級",
    category: "phrase",
    question: "The new system is ___ into effect next month.",
    choices: ["coming", "going", "getting", "making"],
    answerIndex: 0,
    explanation: "come into effect で「〜が発効する、実施される」という意味です。",
    japanese: "新しい制度は来月実施されます。"
  },
  {
    id: "eiken-pre2-written-060",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best sentence: The findings of this study ___ our understanding of the topic.",
    choices: ["have changed", "change", "changed", "changing"],
    answerIndex: 0,
    explanation: "現在完了 have changed で「変えてきた」という継続的な影響を表します。",
    japanese: "最もよい文を選びなさい。この研究の結果はそのトピックに対する私たちの理解を変えてきました。"
  },
  {
    id: "eiken-pre2-written-061",
    level: "英検準2級",
    category: "grammar",
    question: "The document ___ before the meeting starts.",
    choices: ["needs to be prepared", "needs to prepare", "need preparing", "preparing"],
    answerIndex: 0,
    explanation: "need to be + 過去分詞で「〜される必要がある」という受け身を表します。",
    japanese: "会議が始まる前に書類を準備する必要があります。"
  },
  {
    id: "eiken-pre2-written-062",
    level: "英検準2級",
    category: "vocabulary",
    question: "Scientists are working hard to ___ a cure for the disease.",
    choices: ["develop", "decide", "deliver", "demand"],
    answerIndex: 0,
    explanation: "develop a cure で「治療法を開発する」という意味です。",
    japanese: "科学者たちはその病気の治療法を開発するために懸命に取り組んでいます。"
  },
  {
    id: "eiken-pre2-written-063",
    level: "英検準2級",
    category: "conversation",
    question: "A: What do you do to improve your English? B: ___",
    choices: ["I watch English movies and read articles every day.", "I am fine.", "She is nice.", "It is cold."],
    answerIndex: 0,
    explanation: "What do you do to ...? には具体的な方法を答えます。",
    japanese: "A: 英語力を上げるために何をしていますか。B: 毎日英語の映画を見たり、記事を読んだりしています。"
  },
  {
    id: "eiken-pre2-written-064",
    level: "英検準2級",
    category: "grammar",
    question: "She noticed that her wallet ___ from her bag.",
    choices: ["had been stolen", "was stealing", "has stolen", "stole"],
    answerIndex: 0,
    explanation: "過去の時点までに完了した受け身は過去完了の受け身（had been + 過去分詞）で表します。",
    japanese: "彼女はかばんから財布が盗まれていたことに気づきました。"
  },
  {
    id: "eiken-pre2-written-065",
    level: "英検準2級",
    category: "vocabulary",
    question: "The athlete showed incredible ___ in the final race.",
    choices: ["determination", "decoration", "destination", "description"],
    answerIndex: 0,
    explanation: "最終レースで見せる強さは determination「決意」です。",
    japanese: "その選手は最終レースで信じられないほどの決意を見せました。"
  },
  {
    id: "eiken-pre2-written-066",
    level: "英検準2級",
    category: "phrase",
    question: "I need to ___ up on the latest news before the discussion.",
    choices: ["catch", "pick", "come", "give"],
    answerIndex: 0,
    explanation: "catch up on ... で「〜を追いかける、最新情報を得る」という意味です。",
    japanese: "私は討論の前に最新のニュースを把握する必要があります。"
  },
  {
    id: "eiken-pre2-written-067",
    level: "英検準2級",
    category: "grammar",
    question: "This is the city ___ my grandparents used to live.",
    choices: ["where", "which", "that", "who"],
    answerIndex: 0,
    explanation: "場所を修飾する関係副詞は where を使います。",
    japanese: "これは私の祖父母がかつて住んでいた街です。"
  },
  {
    id: "eiken-pre2-written-068",
    level: "英検準2級",
    category: "vocabulary",
    question: "The company faced ___ opposition to its new plan.",
    choices: ["strong", "fast", "long", "short"],
    answerIndex: 0,
    explanation: "opposition「反対」を強調する形容詞は strong「強い」です。",
    japanese: "その会社は新しい計画に対して強い反対意見に直面しました。"
  },
  {
    id: "eiken-pre2-written-069",
    level: "英検準2級",
    category: "conversation",
    question: "A: Do you think technology is changing our lives? B: ___",
    choices: ["Yes, definitely. It has improved communication and access to information.", "I am fine.", "She is kind.", "It is cold."],
    answerIndex: 0,
    explanation: "Do you think ...? には意見を述べます。",
    japanese: "A: テクノロジーは私たちの生活を変えていると思いますか。B: はい、確実に。コミュニケーションと情報へのアクセスが向上しました。"
  },
  {
    id: "eiken-pre2-written-070",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best word: She was ___ to speak in front of so many people.",
    choices: ["reluctant", "ready", "able", "willing"],
    answerIndex: 0,
    explanation: "be reluctant to do で「〜することに気乗りしない」という意味です。",
    japanese: "最もよい単語を選びなさい。彼女はとても多くの人前で話すことに気乗りしませんでした。"
  },
  {
    id: "eiken-pre2-written-071",
    level: "英検準2級",
    category: "grammar",
    question: "Despite ___ hard, she didn't pass the exam.",
    choices: ["studying", "study", "studied", "to study"],
    answerIndex: 0,
    explanation: "despite の後には動名詞（-ing 形）を使います。",
    japanese: "一生懸命勉強したにもかかわらず、彼女は試験に合格しませんでした。"
  },
  {
    id: "eiken-pre2-written-072",
    level: "英検準2級",
    category: "vocabulary",
    question: "We should ___ our goals before we start the project.",
    choices: ["clarify", "classify", "close", "climb"],
    answerIndex: 0,
    explanation: "clarify は「〜を明確にする」という意味です。",
    japanese: "プロジェクトを始める前に目標を明確にすべきです。"
  },
  {
    id: "eiken-pre2-written-073",
    level: "英検準2級",
    category: "phrase",
    question: "The results of the experiment were ___ line with our predictions.",
    choices: ["in", "on", "at", "by"],
    answerIndex: 0,
    explanation: "in line with ... で「〜と一致して」という意味です。",
    japanese: "実験の結果は私たちの予測と一致していました。"
  },
  {
    id: "eiken-pre2-written-074",
    level: "英検準2級",
    category: "grammar",
    question: "I had my car ___ at the garage last week.",
    choices: ["repaired", "repair", "repairing", "to repair"],
    answerIndex: 0,
    explanation: "have + 目的語 + 過去分詞で「〜してもらう」という意味です。",
    japanese: "先週、ガレージで車を修理してもらいました。"
  },
  {
    id: "eiken-pre2-written-075",
    level: "英検準2級",
    category: "vocabulary",
    question: "The new app has become very ___ among teenagers.",
    choices: ["popular", "dangerous", "expensive", "boring"],
    answerIndex: 0,
    explanation: "become popular among ... で「〜の間で人気になる」という意味です。",
    japanese: "その新しいアプリはティーンエイジャーの間でとても人気になりました。"
  },
  {
    id: "eiken-pre2-written-076",
    level: "英検準2級",
    category: "conversation",
    question: "A: What is one thing you would like to change about your school? B: ___",
    choices: ["I'd like to see more club activities and events.", "I am fine.", "It is cold.", "She is tall."],
    answerIndex: 0,
    explanation: "What would you like to change about ...? には具体的な意見を述べます。",
    japanese: "A: 学校について変えたいことは何ですか。B: もっと多くのクラブ活動とイベントがあるといいと思います。"
  },
  {
    id: "eiken-pre2-written-077",
    level: "英検準2級",
    category: "grammar",
    question: "She is ___ enough to understand the problem.",
    choices: ["intelligent", "intelligence", "intelligently", "intellect"],
    answerIndex: 0,
    explanation: "be + 形容詞 + enough to do で「〜するほど…だ」という意味です。",
    japanese: "彼女はその問題を理解できるほど賢いです。"
  },
  {
    id: "eiken-pre2-written-078",
    level: "英検準2級",
    category: "vocabulary",
    question: "The island is ___ by beautiful coral reefs.",
    choices: ["surrounded", "supported", "supplied", "suggested"],
    answerIndex: 0,
    explanation: "be surrounded by ... で「〜に囲まれている」という意味です。",
    japanese: "その島は美しいサンゴ礁に囲まれています。"
  },
  {
    id: "eiken-pre2-written-079",
    level: "英検準2級",
    category: "phrase",
    question: "We need to ___ a conclusion based on the evidence.",
    choices: ["draw", "make", "do", "take"],
    answerIndex: 0,
    explanation: "draw a conclusion で「結論を出す」という意味です。",
    japanese: "証拠に基づいて結論を出す必要があります。"
  },
  {
    id: "eiken-pre2-written-080",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best sentence: The factory has been ___ since the fire last year.",
    choices: ["closed", "close", "closing", "closes"],
    answerIndex: 0,
    explanation: "has been + 過去分詞で受け身の現在完了を表します。",
    japanese: "最もよい文を選びなさい。その工場は昨年の火災以来閉鎖されています。"
  },
  {
    id: "eiken-pre2-written-081",
    level: "英検準2級",
    category: "grammar",
    question: "I'm not sure ___ to do next.",
    choices: ["what", "who", "where", "when"],
    answerIndex: 0,
    explanation: "what to do で「何をすべきか」という意味です。",
    japanese: "次に何をすればよいかわかりません。"
  },
  {
    id: "eiken-pre2-written-082",
    level: "英検準2級",
    category: "vocabulary",
    question: "The author's new novel received ___ reviews from critics.",
    choices: ["excellent", "boring", "ordinary", "strange"],
    answerIndex: 0,
    explanation: "critics「批評家」からの excellent reviews「絶賛のレビュー」が合います。",
    japanese: "その作家の新しい小説は批評家から絶賛のレビューを受けました。"
  },
  {
    id: "eiken-pre2-written-083",
    level: "英検準2級",
    category: "conversation",
    question: "A: What challenges do young people face today? B: ___",
    choices: ["Finding jobs and dealing with social media pressure are major challenges.", "I am fine.", "She is tall.", "It is cold."],
    answerIndex: 0,
    explanation: "What challenges ...? には具体的な課題を述べます。",
    japanese: "A: 若者は今日どんな課題に直面していますか。B: 就職とソーシャルメディアのプレッシャーへの対処が主な課題です。"
  },
  {
    id: "eiken-pre2-written-084",
    level: "英検準2級",
    category: "grammar",
    question: "Unless you study harder, you ___ pass the test.",
    choices: ["won't", "will", "do", "would"],
    answerIndex: 0,
    explanation: "unless は「〜しない限り」という否定の条件を表します。否定の未来には won't を使います。",
    japanese: "もっと一生懸命勉強しなければ、テストに合格できません。"
  },
  {
    id: "eiken-pre2-written-085",
    level: "英検準2級",
    category: "vocabulary",
    question: "The speaker ___ the importance of teamwork in his talk.",
    choices: ["emphasized", "enjoyed", "escaped", "elected"],
    answerIndex: 0,
    explanation: "emphasize は「〜を強調する」という意味です。",
    japanese: "スピーカーはトークでチームワークの重要性を強調しました。"
  },
  {
    id: "eiken-pre2-written-086",
    level: "英検準2級",
    category: "phrase",
    question: "He ___ up with a solution after hours of thinking.",
    choices: ["came", "went", "got", "made"],
    answerIndex: 0,
    explanation: "come up with ... で「〜を思いつく」という意味です。",
    japanese: "何時間も考えた後、彼は解決策を思いつきました。"
  },
  {
    id: "eiken-pre2-written-087",
    level: "英検準2級",
    category: "grammar",
    question: "The performance ___ for three hours without a break.",
    choices: ["lasted", "last", "lasting", "has last"],
    answerIndex: 0,
    explanation: "last は「続く」という意味で、過去の出来事なので lasted を使います。",
    japanese: "公演は休憩なしに3時間続きました。"
  },
  {
    id: "eiken-pre2-written-088",
    level: "英検準2級",
    category: "vocabulary",
    question: "The teacher encouraged students to be ___ in sharing their opinions.",
    choices: ["confident", "careful", "confused", "creative"],
    answerIndex: 0,
    explanation: "意見を述べることに必要な態度は confident「自信のある」です。",
    japanese: "先生は生徒たちが自信を持って意見を述べるよう励ましました。"
  },
  {
    id: "eiken-pre2-written-089",
    level: "英検準2級",
    category: "conversation",
    question: "A: What kind of books do you enjoy reading? B: ___",
    choices: ["I enjoy historical fiction and biographies.", "I am fine.", "She is nice.", "He went home."],
    answerIndex: 0,
    explanation: "What kind of books ...? には好きなジャンルを答えます。",
    japanese: "A: どんな種類の本を読むのが好きですか。B: 歴史小説と伝記が好きです。"
  },
  {
    id: "eiken-pre2-written-090",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best sentence: The new regulation was ___ to reduce traffic accidents.",
    choices: ["designed", "design", "designing", "designs"],
    answerIndex: 0,
    explanation: "was designed to do で「〜するために設計された」という意味の受け身を表します。",
    japanese: "最もよい文を選びなさい。新しい規制は交通事故を減らすために設けられました。"
  },
  {
    id: "eiken-pre2-written-091",
    level: "英検準2級",
    category: "grammar",
    question: "She was ___ to see her old friend after so many years.",
    choices: ["thrilled", "thrill", "thrilling", "thrills"],
    answerIndex: 0,
    explanation: "be thrilled to do で「〜することにとてもわくわくする」という意味です。",
    japanese: "彼女は何年もたった後に旧友に会えてとても喜んでいました。"
  },
  {
    id: "eiken-pre2-written-092",
    level: "英検準2級",
    category: "vocabulary",
    question: "The politician promised to ___ the needs of all citizens.",
    choices: ["address", "avoid", "accept", "achieve"],
    answerIndex: 0,
    explanation: "address the needs of ... で「〜のニーズに対応する」という意味です。",
    japanese: "その政治家はすべての市民のニーズに対応することを約束しました。"
  },
  {
    id: "eiken-pre2-written-093",
    level: "英検準2級",
    category: "phrase",
    question: "She made a point of ___ to the gym every morning.",
    choices: ["going", "go", "went", "goes"],
    answerIndex: 0,
    explanation: "make a point of doing で「必ず〜する」という意味です。",
    japanese: "彼女は毎朝必ずジムへ行くようにしていました。"
  },
  {
    id: "eiken-pre2-written-094",
    level: "英検準2級",
    category: "grammar",
    question: "The students ___ to submit their essays by the end of the week.",
    choices: ["are required", "require", "requiring", "required"],
    answerIndex: 0,
    explanation: "are required to do で「〜することを求められる」という受け身を表します。",
    japanese: "生徒たちは今週末までにエッセイを提出することを求められています。"
  },
  {
    id: "eiken-pre2-written-095",
    level: "英検準2級",
    category: "vocabulary",
    question: "The charity event ___ a large amount of money for the hospital.",
    choices: ["raised", "rose", "risen", "raise"],
    answerIndex: 0,
    explanation: "raise money で「お金を集める・調達する」という意味です。",
    japanese: "チャリティーイベントは病院のために多額のお金を集めました。"
  },
  {
    id: "eiken-pre2-written-096",
    level: "英検準2級",
    category: "conversation",
    question: "A: What's your opinion on social media? B: ___",
    choices: ["It's useful for communication, but it can also have negative effects.", "I am fine.", "It is cold.", "She is tall."],
    answerIndex: 0,
    explanation: "What's your opinion on ...? には賛否両方を踏まえた意見を述べます。",
    japanese: "A: ソーシャルメディアについてどう思いますか。B: コミュニケーションに役立ちますが、悪影響もあります。"
  },
  {
    id: "eiken-pre2-written-097",
    level: "英検準2級",
    category: "grammar",
    question: "They have been friends ___ they were in elementary school.",
    choices: ["since", "for", "during", "until"],
    answerIndex: 0,
    explanation: "since は始まりの時点を表し、現在完了と一緒に使います。",
    japanese: "彼らは小学校のときからずっと友達です。"
  },
  {
    id: "eiken-pre2-written-098",
    level: "英検準2級",
    category: "vocabulary",
    question: "The teacher asked the students to ___ their ideas in a clear way.",
    choices: ["express", "explore", "expand", "expose"],
    answerIndex: 0,
    explanation: "express ideas で「考えを表現する」という意味です。",
    japanese: "先生は生徒たちに考えをわかりやすく表現するよう求めました。"
  },
  {
    id: "eiken-pre2-written-099",
    level: "英検準2級",
    category: "phrase",
    question: "The company decided to ___ an investment in renewable energy.",
    choices: ["make", "do", "take", "give"],
    answerIndex: 0,
    explanation: "make an investment で「投資をする」という意味です。",
    japanese: "その会社は再生可能エネルギーへの投資をすることを決めました。"
  },
  {
    id: "eiken-pre2-written-100",
    level: "英検準2級",
    category: "writing",
    question: "Choose the best sentence: Children should be ___ to express themselves freely.",
    choices: ["encouraged", "encourage", "encouraging", "encourages"],
    answerIndex: 0,
    explanation: "be encouraged to do で「〜するよう励まされる」という意味です。",
    japanese: "最もよい文を選びなさい。子どもたちは自由に自己表現するよう励まされるべきです。"
  }
];

export default eikenPre2Written001_100;
