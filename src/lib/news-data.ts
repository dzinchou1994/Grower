import { cache } from "react";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n";
import { autoTranslateText } from "@/lib/auto-translate";

export type NewsScope = "GEORGIA" | "WORLD";
export type NewsSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type NewsArticleRecord = {
  id: string;
  slug: string;
  scope: NewsScope;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  body: Record<Locale, string>;
  isPublished: boolean;
  createdAt: string;
};

export type NewsSubmissionRecord = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  scope: NewsScope;
  status: NewsSubmissionStatus;
  adminNote?: string;
  createdAt: string;
  submitterUsername?: string;
};

const hasDatabase = Boolean(process.env.DATABASE_URL);

type NewsSeed = Omit<NewsArticleRecord, "id" | "createdAt" | "isPublished"> & {
  createdAt: string;
};

const seededNews: NewsSeed[] = [
  {
    slug: "georgia-expands-hemp-dialogue-2026",
    scope: "GEORGIA",
    imageUrl: "/news/georgia-industrial-cannabis-field.webp",
    sourceName: "Grower Editorial",
    sourceUrl: "https://grower.ge",
    title: {
      ka: "საქართველოში სამრეწველო კანაფზე საჯარო დიალოგი ახალ ეტაპზე გადადის",
      en: "Georgia's industrial hemp dialogue enters a new phase in 2026",
      ru: "Диалог о промышленной конопле в Грузии выходит на новый этап",
    },
    excerpt: {
      ka: "თბილისში გამართულ მრგვალ მაგიდაზე ექსპერტებმა, აგრობიზნესის წარმომადგენლებმა და პოლიტიკოსებმა სამრეწველო კანაფის რეგულირების კონკრეტული გეგმა წარმოადგინეს - საქართველო ევროპული მოდელის ადაპტირებას განიხილავს.",
      en: "At a Tbilisi roundtable, experts, agribusiness leaders, and policymakers presented a concrete plan for hemp regulation - Georgia is considering adapting the European model.",
      ru: "На круглом столе в Тбилиси эксперты, представители агробизнеса и политики представили конкретный план регулирования конопли - Грузия рассматривает адаптацию европейской модели.",
    },
    body: {
      ka: `2026 წლის მარტში თბილისის სასტუმრო „რუმსში" გამართულ მრგვალ მაგიდაზე 40-ზე მეტი მონაწილე შეიკრიბა - მათ შორის აგრონომები, იურისტები, არასამთავრობო ორგანიზაციების წარმომადგენლები და პარლამენტის რამდენიმე წევრი. დისკუსიის მთავარი თემა იყო: შეუძლია თუ არა საქართველოს სამრეწველო კანაფის ბაზრის ლეგალური ჩარჩოს შექმნა ისე, რომ ევროკავშირის სტანდარტებთან თავსებადობა შენარჩუნდეს?

მომხსენებლებმა წარმოადგინეს კვლევა, რომლის მიხედვითაც საქართველოს კლიმატური პირობები იდეალურია სამრეწველო კანაფის კულტივაციისთვის - განსაკუთრებით კახეთისა და იმერეთის რეგიონები. ექსპერტთა შეფასებით, THC-ს დაბალი შემცველობის მქონე ჯიშების მოყვანა შესაძლებელია წელიწადში ორი მოსავლით, რაც ექსპორტის პოტენციალს მნიშვნელოვნად ზრდის.

განსაკუთრებული ყურადღება დაეთმო ევროკავშირის 2023 წლის დირექტივას, რომელიც THC-ს ზღვარს 0.3%-ზე ადგენს. ქართველი იურისტების შეფასებით, ანალოგიური ნორმის მიღება საქართველოში ხელს შეუწყობს საერთაშორისო ინვესტორების მოზიდვას, რადგან ბიზნესი ნათელ სამართლებრივ ჩარჩოს საჭიროებს.

ერთ-ერთი ყველაზე აქტიური დისკუსია გაიმართა ლიცენზირების მოდელის ირგვლივ. ნაწილი მონაწილეებისა კანადის მოდელს ემხრობოდა, სადაც ლიცენზიები ცენტრალიზებულად გაიცემა; დანარჩენებმა შვეიცარიის დეცენტრალიზებული მიდგომა ურჩია - სადაც ადგილობრივი კანტონები თავად არეგულირებენ. საბოლოოდ, მონაწილეებმა შეთანხმდნენ, რომ საქართველოსთვის ჰიბრიდული მოდელი იქნება ოპტიმალური.

აგრობიზნესის წარმომადგენლებმა აქცენტი გააკეთეს დასაქმების პოტენციალზეც. მათი პროგნოზით, რეგულირებული სამრეწველო კანაფის სექტორს შეუძლია პირველ ორ წელიწადში 3 000-მდე სამუშაო ადგილის შექმნა, ძირითადად სოფლის რეგიონებში, სადაც უმუშევრობის დონე საშუალოზე მაღალია.

შეხვედრა დასრულდა სამოქმედო გეგმის პროექტის წარდგენით, რომლის მიხედვითაც 2026 წლის მეორე ნახევარში უნდა მომზადდეს საკანონმდებლო წინადადება. ორგანიზატორებმა აღნიშნეს, რომ მომდევნო შეხვედრა ბათუმში დაიგეგმება, სადაც აჭარის რეგიონის სპეციფიკაზეც იმსჯელებენ.`,
      en: `In March 2026, more than 40 participants gathered at the Rooms Hotel in Tbilisi for a landmark roundtable - among them agronomists, lawyers, NGO representatives, and several members of Parliament. The central question was clear: can Georgia create a legal framework for industrial hemp that remains compatible with European Union standards?

Speakers presented research showing that Georgia's climate is ideally suited for industrial hemp cultivation, particularly in the Kakheti and Imereti regions. Experts estimated that low-THC varieties could yield two harvests per year, significantly boosting export potential.

Particular attention was paid to the EU's 2023 directive setting the THC threshold at 0.3%. Georgian legal analysts argued that adopting an analogous standard domestically would help attract international investors, since businesses need a clear legal framework to commit capital.

One of the most spirited debates centered on the licensing model. Some participants favored the Canadian approach, where licenses are issued centrally; others recommended Switzerland's decentralized system, where local cantons manage regulation themselves. In the end, attendees agreed that a hybrid model would be the best fit for Georgia.

Agribusiness representatives also emphasized the employment potential. By their estimates, a regulated industrial hemp sector could create up to 3,000 jobs within the first two years - mostly in rural areas where unemployment is above the national average.

The meeting concluded with a draft action plan calling for legislative proposals to be prepared by the second half of 2026. Organizers noted that the next session would take place in Batumi, where participants will also discuss the specific conditions of the Adjara region.`,
      ru: `В марте 2026 года в тбилисском отеле Rooms более 40 участников собрались за круглым столом - среди них агрономы, юристы, представители НКО и несколько депутатов парламента. Главный вопрос повестки: может ли Грузия создать правовую базу для промышленной конопли, оставаясь совместимой со стандартами Европейского союза?

Докладчики представили исследования, показывающие, что климат Грузии идеально подходит для выращивания промышленной конопли - особенно в регионах Кахети и Имерети. По оценкам экспертов, сорта с низким содержанием ТГК могут давать два урожая в год, что существенно увеличивает экспортный потенциал.

Особое внимание было уделено директиве ЕС 2023 года, устанавливающей порог ТГК на уровне 0,3%. Грузинские юристы отметили, что принятие аналогичного стандарта поможет привлечь международных инвесторов, поскольку бизнесу необходима чёткая правовая база для вложения капитала.

Одна из самых оживлённых дискуссий развернулась вокруг модели лицензирования. Часть участников поддержала канадский подход с централизованной выдачей лицензий, другие рекомендовали децентрализованную швейцарскую систему, где регулирование осуществляется на уровне кантонов. В итоге участники сошлись на том, что для Грузии оптимальной будет гибридная модель.

Представители агробизнеса также подчеркнули потенциал создания рабочих мест. По их прогнозам, регулируемый сектор промышленной конопли способен обеспечить до 3 000 рабочих мест в первые два года - преимущественно в сельских районах, где уровень безработицы выше среднего по стране.

Встреча завершилась представлением проекта плана действий, согласно которому законодательные предложения должны быть подготовлены ко второй половине 2026 года. Организаторы сообщили, что следующая сессия пройдёт в Батуми с акцентом на специфику Аджарского региона.`,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
  {
    slug: "eu-market-shows-strong-cbd-growth-2026",
    scope: "WORLD",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop&crop=center",
    sourceName: "Grower Market Desk",
    sourceUrl: "https://grower.ge",
    title: {
      ka: "ევროპული CBD ბაზარი 2026 წელს რეკორდულ ზრდას აფიქსირებს - რა დგას ციფრების უკან?",
      en: "Europe's CBD market hits record growth in 2026 - what's behind the numbers?",
      ru: "Рынок CBD в Европе бьёт рекорды роста в 2026 году - что стоит за цифрами?",
    },
    excerpt: {
      ka: "ევროკავშირის CBD ბაზრის მოცულობა 2026 წლის პირველ კვარტალში 4.2 მილიარდ ევროს მიაღწია. ანალიტიკოსები ზრდის მთავარ მამოძრავებლად გამჭვირვალე ლაბორატორიულ ტესტირებას, ახალ დისტრიბუციის არხებს და მომხმარებლის ცნობიერების ამაღლებას ასახელებენ.",
      en: "The EU CBD market reached €4.2 billion in Q1 2026. Analysts point to transparent lab testing, new distribution channels, and rising consumer awareness as the main growth drivers.",
      ru: "Объём рынка CBD в ЕС достиг €4,2 млрд в первом квартале 2026 года. Аналитики называют главными драйверами роста прозрачное лабораторное тестирование, новые каналы дистрибуции и повышение осведомлённости потребителей.",
    },
    body: {
      ka: `ევროპული CBD ინდუსტრიის კვარტალური მიმოხილვის თანახმად, 2026 წლის პირველ სამ თვეში ბაზრის მოცულობა 4.2 მილიარდ ევროს მიაღწია - ეს 28%-იანი ზრდაა წინა წლის ანალოგიურ პერიოდთან შედარებით. ყველაზე სწრაფი ზრდა დაფიქსირდა გერმანიაში, საფრანგეთსა და ჩეხეთში.

ანალიტიკური კომპანია Brightfield Group-ის მონაცემებით, ზრდის ერთ-ერთი მთავარი ფაქტორია მომხმარებლის ნდობის ამაღლება. კვლევამ აჩვენა, რომ ევროპელი მყიდველების 67% ახლა უკვე ამოწმებს CBD პროდუქტის ლაბორატორიულ სერტიფიკატს შეძენამდე - 2024 წელს ეს მაჩვენებელი მხოლოდ 41% იყო.

კიდევ ერთი მნიშვნელოვანი ტენდენცია - აფთიაქების ქსელების შემოსვლა CBD სეგმენტში. გერმანიის უმსხვილესმა აფთიაქების ჯაჭვმა dm-მა 2026 წლის თებერვალში CBD ზეთების და კრემების ხაზი გამოუშვა, რომელმაც პირველ თვეშივე გაყიდვების მხრივ კოსმეტიკის კატეგორიის ტოპ-10-ში მოხვდა.

ბაზრის სტრუქტურაც იცვლება. თუ ადრე ონლაინ-გაყიდვები დომინირებდა (2023 წელს - 78%), 2026-ში ფიზიკური მაღაზიების წილი 39%-მდე გაიზარდა. ეს იმის მაჩვენებელია, რომ CBD პროდუქტები მეინსტრიმ საცალო ვაჭრობაში ინტეგრირდება.

თუმცა გამოწვევებიც არსებობს. ევროკავშირის ახალი რეგულაცია „Novel Food"-ის შესახებ ავალდებულებს მწარმოებლებს დამატებითი სერტიფიცირების გავლას, რაც მცირე ბრენდებისთვის ფინანსურად მძიმეა. ექსპერტთა შეფასებით, 2027 წლისთვის ბაზარზე მხოლოდ ის კომპანიები დარჩებიან, რომლებიც მკაცრი ხარისხის სტანდარტებს აკმაყოფილებენ.

საინტერესოა, რომ ბაზრის ზრდა არა მხოლოდ დასავლეთ ევროპას ეხება. პოლონეთი, რუმინეთი და ბულგარეთი სწრაფად განვითარებად ბაზრებად იქცნენ - ამ ქვეყნებში CBD პროდუქტების იმპორტი 2025-2026 წლებში გაორმაგდა.`,
      en: `According to the quarterly review of Europe's CBD industry, market volume reached €4.2 billion in the first three months of 2026 - a 28% increase year-over-year. The fastest growth was recorded in Germany, France, and the Czech Republic.

Data from analytics firm Brightfield Group shows that one of the key growth factors is rising consumer trust. Research found that 67% of European buyers now check a CBD product's lab certificate before purchasing - up from just 41% in 2024.

Another significant trend is the entry of pharmacy chains into the CBD segment. Germany's largest drugstore chain, dm, launched a line of CBD oils and creams in February 2026 that entered the top 10 of the cosmetics category in its first month of sales.

The market structure is also shifting. While online sales previously dominated (78% in 2023), physical retail's share grew to 39% in 2026. This indicates that CBD products are integrating into mainstream retail channels.

Challenges remain, however. The EU's updated Novel Food regulation requires producers to undergo additional certification - a financial burden for smaller brands. Experts predict that by 2027, only companies meeting strict quality standards will survive on the market.

Notably, market growth is not limited to Western Europe. Poland, Romania, and Bulgaria have emerged as fast-growing markets, with CBD product imports doubling between 2025 and 2026.`,
      ru: `Согласно квартальному обзору европейской CBD-индустрии, объём рынка в первые три месяца 2026 года достиг €4,2 млрд - рост на 28% в годовом выражении. Наиболее быстрый рост зафиксирован в Германии, Франции и Чехии.

По данным аналитической компании Brightfield Group, один из ключевых факторов роста - повышение доверия потребителей. Исследование показало, что 67% европейских покупателей теперь проверяют лабораторный сертификат CBD-продукта перед покупкой - в 2024 году этот показатель составлял лишь 41%.

Ещё одна значимая тенденция - выход аптечных сетей в сегмент CBD. Крупнейшая немецкая сеть dm в феврале 2026 года запустила линейку CBD-масел и кремов, которая в первый же месяц вошла в топ-10 категории косметики по продажам.

Меняется и структура рынка. Если раньше доминировали онлайн-продажи (78% в 2023 году), то в 2026-м доля физической розницы выросла до 39%. Это свидетельствует об интеграции CBD-продуктов в мейнстрим-ретейл.

Впрочем, вызовы сохраняются. Обновлённый регламент ЕС о «новых пищевых продуктах» (Novel Food) обязывает производителей проходить дополнительную сертификацию, что финансово обременительно для небольших брендов. По прогнозам экспертов, к 2027 году на рынке останутся только компании, соответствующие строгим стандартам качества.

Примечательно, что рост рынка не ограничивается Западной Европой. Польша, Румыния и Болгария стали быстрорастущими рынками - импорт CBD-продуктов в эти страны удвоился в 2025–2026 годах.`,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    slug: "ai-greenhouse-controls-improve-yields",
    scope: "WORLD",
    imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&h=630&fit=crop&crop=center",
    sourceName: "Grower Tech",
    sourceUrl: "https://grower.ge",
    title: {
      ka: "ხელოვნური ინტელექტი სათბურებში: როგორ ზრდის AI მოსავლიანობას 40%-ით",
      en: "AI in greenhouses: how smart controllers are boosting yields by 40%",
      ru: "ИИ в теплицах: как умные контроллеры повышают урожайность на 40%",
    },
    excerpt: {
      ka: "ნიდერლანდებისა და ისრაელის ფერმერები AI-ზე დაფუძნებულ სათბურის მართვის სისტემებზე გადადიან. პილოტური პროექტების შედეგები აჩვენებს, რომ ავტომატიზაცია ენერგიის ხარჯებს 25%-ით, ხოლო წყლის მოხმარებას 30%-ით ამცირებს.",
      en: "Farmers in the Netherlands and Israel are switching to AI-powered greenhouse management systems. Pilot projects show automation cutting energy costs by 25% and water usage by 30%.",
      ru: "Фермеры в Нидерландах и Израиле переходят на системы управления теплицами на базе ИИ. Пилотные проекты показывают снижение энергозатрат на 25% и расхода воды на 30%.",
    },
    body: {
      ka: `აგროტექნოლოგიების სექტორში ბოლო წლების ერთ-ერთი ყველაზე მნიშვნელოვანი ტრენდი ხელოვნური ინტელექტის გამოყენებაა სათბურის კლიმატის მართვაში. ნიდერლანდების Wageningen-ის უნივერსიტეტის 2026 წლის კვლევის მიხედვით, AI-ზე დაფუძნებულმა სისტემებმა საშუალოდ 40%-ით გაზარდეს მოსავლიანობა ტრადიციულ მეთოდებთან შედარებით.

სისტემა რეალურ დროში აანალიზებს ტემპერატურის, ტენიანობის, CO₂ დონის და განათების მონაცემებს ასობით სენსორიდან. ტრადიციული თერმოსტატისგან განსხვავებით, AI ალგორითმი წინასწარ პროგნოზირებს კლიმატის ცვლილებას და კორექტირებას ახდენს სანამ პრობლემა წარმოიქმნება - მაგალითად, ღამის ტემპერატურის ვარდნამდე 30 წუთით ადრე იწყებს გათბობის ინტენსივობის ზრდას.

ისრაელის სტარტაპმა Phytech-მა ნიდერლანდებში ჩაატარა 18-თვიანი პილოტური პროექტი 12 სათბურში. შედეგებმა აჩვენა, რომ ენერგიის ხარჯი 25%-ით შემცირდა, წყლის მოხმარება - 30%-ით, ხოლო პროდუქციის ხარისხის სტაბილურობა 92%-მდე გაიზარდა (ტრადიციული მეთოდით ეს მაჩვენებელი 71% იყო).

განსაკუთრებით საინტერესოა ენერგომოხმარების ოპტიმიზაცია. AI სისტემები დინამიურად მართავენ პიკურ და არაპიკურ დატვირთვას - მაგალითად, ღამის საათებში, როცა ელექტროენერგია იაფია, სისტემა ინტენსიურად ათბობს სათბურს, ხოლო დღის პიკურ საათებში მინიმუმამდე ამცირებს მოხმარებას.

მცირე და საშუალო ფერმერებისთვის ფასი ჯერ კიდევ ბარიერია - სრული AI სისტემის ინსტალაცია ერთ ჰექტარზე 15 000-დან 25 000 ევრომდე ჯდება. თუმცა SaaS მოდელზე მომუშავე კომპანიები, როგორიცაა ნიდერლანდური 30MHz და ისრაელური Prospera, თვიური გამოწერის ფორმატში სთავაზობენ სერვისს, რაც საწყის ინვესტიციას მინიმუმამდე ამცირებს.

ექსპერტთა პროგნოზით, 2028 წლისთვის ევროპის სათბურების 60% რაიმე ფორმით AI ტექნოლოგიას გამოიყენებს. ეს განსაკუთრებით აქტუალურია კანაფის ინდუსტრიისთვის, სადაც კლიმატის სტაბილურობა პირდაპირ აისახება კანაბინოიდების პროფილისა და მოსავლის ხარისხზე.`,
      en: `One of the most significant trends in agritech over recent years is the use of artificial intelligence for greenhouse climate management. A 2026 study from Wageningen University in the Netherlands found that AI-based systems increased yields by an average of 40% compared to traditional methods.

These systems analyze real-time data on temperature, humidity, CO₂ levels, and lighting from hundreds of sensors. Unlike conventional thermostats, the AI algorithm predicts climate changes in advance and makes adjustments before problems arise - for example, it begins ramping up heating intensity 30 minutes before a nighttime temperature drop.

Israeli startup Phytech ran an 18-month pilot project across 12 greenhouses in the Netherlands. Results showed a 25% reduction in energy costs, a 30% decrease in water consumption, and product quality consistency reaching 92% - compared to 71% under traditional management.

The energy optimization aspect is particularly interesting. AI systems dynamically manage peak and off-peak loads. During nighttime hours when electricity is cheaper, the system heats the greenhouse intensively; during peak daytime hours, it minimizes consumption to cut costs.

For small and mid-sized growers, cost remains a barrier - full AI system installation runs from €15,000 to €25,000 per hectare. However, SaaS-model companies like the Dutch firm 30MHz and Israel's Prospera offer monthly subscription services that minimize upfront investment.

Experts predict that by 2028, 60% of European greenhouses will use some form of AI technology. This is especially relevant for the cannabis industry, where climate stability directly affects cannabinoid profiles and overall harvest quality.`,
      ru: `Один из наиболее значимых трендов в агротехнологиях последних лет - применение искусственного интеллекта для управления климатом теплиц. Исследование 2026 года, проведённое Университетом Вагенингена в Нидерландах, показало, что системы на базе ИИ в среднем повысили урожайность на 40% по сравнению с традиционными методами.

Системы анализируют данные о температуре, влажности, уровне CO₂ и освещении в реальном времени с сотен датчиков. В отличие от обычных термостатов, алгоритм ИИ прогнозирует изменения климата заранее и корректирует параметры до возникновения проблем - например, начинает увеличивать интенсивность отопления за 30 минут до ночного падения температуры.

Израильский стартап Phytech провёл 18-месячный пилотный проект в 12 теплицах Нидерландов. Результаты показали снижение энергозатрат на 25%, расхода воды - на 30%, а стабильность качества продукции выросла до 92% (при традиционном управлении - 71%).

Особенно интересен аспект оптимизации энергопотребления. ИИ-системы динамически управляют пиковыми и внепиковыми нагрузками - например, в ночные часы, когда электричество дешевле, система интенсивно обогревает теплицу, а в дневные пиковые часы сводит потребление к минимуму.

Для малых и средних хозяйств цена остаётся барьером - полная установка ИИ-системы на один гектар стоит от €15 000 до €25 000. Однако компании с SaaS-моделью, такие как нидерландская 30MHz и израильская Prospera, предлагают помесячную подписку, минимизируя начальные инвестиции.

По прогнозам экспертов, к 2028 году 60% европейских теплиц будут использовать ту или иную форму ИИ-технологий. Это особенно актуально для каннабис-индустрии, где стабильность климата напрямую влияет на профиль каннабиноидов и общее качество урожая.`,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    slug: "georgian-community-launches-harm-reduction-workshops",
    scope: "GEORGIA",
    imageUrl: "/news/georgia-harm-reduction-banner.webp",
    sourceName: "Grower Community",
    sourceUrl: "https://grower.ge",
    title: {
      ka: "საქართველოში ზიანის შემცირების საგანმანათლებლო პროგრამა ამოქმედდა",
      en: "Georgia launches harm-reduction education program with community-led workshops",
      ru: "В Грузии стартовала образовательная программа по снижению вреда",
    },
    excerpt: {
      ka: "თბილისში, ბათუმსა და ქუთაისში ჩატარებულ პირველ შეხვედრებს 200-ზე მეტი ადამიანი დაესწრო. პროგრამა მოიცავს რისკების შეფასებას, დეზინფორმაციასთან ბრძოლას და ფსიქოლოგიურ მხარდაჭერის რესურსებს.",
      en: "The first sessions in Tbilisi, Batumi, and Kutaisi drew over 200 attendees. The program covers risk assessment, combating misinformation, and psychological support resources.",
      ru: "Первые встречи в Тбилиси, Батуми и Кутаиси собрали более 200 участников. Программа охватывает оценку рисков, борьбу с дезинформацией и ресурсы психологической поддержки.",
    },
    body: {
      ka: `2026 წლის თებერვალში საქართველოში უპრეცედენტო მასშტაბის საგანმანათლებლო ინიციატივა ამოქმედდა - ზიანის შემცირების (harm reduction) ვორქშოფების სერია, რომელიც ერთდროულად სამ ქალაქში - თბილისში, ბათუმსა და ქუთაისში ჩატარდა. პირველ შეხვედრებს ჯამურად 200-ზე მეტი ადამიანი დაესწრო.

პროგრამის ორგანიზატორი არასამთავრობო ორგანიზაცია „ახალი ხმა" განმარტავს, რომ ინიციატივის მთავარი მიზანია ობიექტური ინფორმაციის გავრცელება და სტიგმის შემცირება. „საქართველოში კანაფთან დაკავშირებული თემა ხშირად ტაბუდადებულია - ადამიანები ვერ იღებენ სწორ ინფორმაციას, რაც რისკებს ზრდის," - აცხადებს ორგანიზაციის დირექტორი ნინო ბერიძე.

პირველი ვორქშოფი თბილისის Fabrika-ში გაიმართა და სამ ძირითად თემას მიეძღვნა: პროდუქტის ხარისხის შეფასების პრაქტიკული მეთოდები, დეზინფორმაციის ამოცნობა სოციალურ ქსელებში და კრიზისული სიტუაციებისთვის მზადყოფნა. მონაწილეებმა მიიღეს პრაქტიკული ჩექლისტები და ფსიქოლოგიური დახმარების ცხელი ხაზის კონტაქტები.

ბათუმის სესია განსაკუთრებულ ინტერესს იწვევდა - ტურისტულ ქალაქში, სადაც სეზონურად მოსახლეობა თითქმის ორმაგდება, ინფორმირებულობის საკითხი განსაკუთრებით მწვავეა. ადგილობრივმა ექიმმა გიორგი ჩხეიძემ ვორქშოფზე წარმოადგინა სამედიცინო პერსპექტივა და ხაზგასმით აღნიშნა პირველადი დახმარების ცოდნის მნიშვნელობა.

ქუთაისში კი პროგრამამ მშობლებსა და პედაგოგებზე ფოკუსირება მოახდინა. მონაწილეთა 60% სწორედ ამ ჯგუფიდან იყო. ორგანიზატორების თქმით, ეს მოულოდნელი, მაგრამ ძალიან პოზიტიური შედეგია - ზრდასრულებს სურთ იცოდნენ, როგორ ესაუბრონ ახალგაზრდებს ამ თემაზე ობიექტურად და შეშინების გარეშე.

პროგრამის მეორე ეტაპი 2026 წლის აპრილ-მაისში იგეგმება და დამატებით რუსთავს, ზუგდიდსა და თელავს მოიცავს. ორგანიზატორები ასევე ამზადებენ ონლაინ კურსს, რომელიც საქართველოს ნებისმიერი კუთხიდან ხელმისაწვდომი იქნება.`,
      en: `In February 2026, an unprecedented educational initiative launched in Georgia - a series of harm-reduction workshops held simultaneously in three cities: Tbilisi, Batumi, and Kutaisi. The first sessions drew a combined total of over 200 attendees.

The program's organizing NGO, "New Voice," explains that the initiative's main goal is disseminating objective information and reducing stigma. "In Georgia, cannabis-related topics are often taboo - people can't access reliable information, which increases risk," says the organization's director, Nino Beridze.

The first workshop, held at Tbilisi's Fabrika space, focused on three core topics: practical methods for assessing product quality, recognizing misinformation on social media, and crisis preparedness. Participants received practical checklists and contact information for psychological support hotlines.

The Batumi session generated particular interest. In this tourist city, where the population nearly doubles seasonally, the question of public awareness is especially acute. Local physician Giorgi Chkheidze presented a medical perspective at the workshop, emphasizing the importance of first-aid knowledge.

In Kutaisi, the program focused on parents and educators. Sixty percent of participants came from these groups. Organizers say this was unexpected but deeply positive - adults want to know how to talk to young people about these topics objectively and without resorting to fear tactics.

The program's second phase is planned for April–May 2026 and will expand to include Rustavi, Zugdidi, and Telavi. Organizers are also developing an online course that will be accessible from anywhere in Georgia.`,
      ru: `В феврале 2026 года в Грузии стартовала беспрецедентная по масштабу образовательная инициатива - серия воркшопов по снижению вреда (harm reduction), которая одновременно прошла в трёх городах: Тбилиси, Батуми и Кутаиси. Первые встречи привлекли в общей сложности более 200 участников.

Организатор программы, НКО «Новый голос», поясняет, что главная цель - распространение объективной информации и снижение стигмы. «В Грузии темы, связанные с каннабисом, часто табуированы - люди не могут получить достоверную информацию, что повышает риски», - говорит директор организации Нино Беридзе.

Первый воркшоп в тбилисском пространстве Fabrika был посвящён трём ключевым темам: практические методы оценки качества продукта, распознавание дезинформации в соцсетях и готовность к кризисным ситуациям. Участники получили практические чеклисты и контакты горячей линии психологической помощи.

Особый интерес вызвала батумская сессия. В курортном городе, где население в сезон почти удваивается, вопрос информированности стоит особенно остро. Местный врач Георгий Чхеидзе представил медицинскую перспективу и подчеркнул важность знания основ первой помощи.

В Кутаиси программа сфокусировалась на родителях и педагогах - 60% участников пришли именно из этих групп. По словам организаторов, это стало неожиданным, но очень позитивным результатом: взрослые хотят знать, как объективно и без запугивания говорить с молодёжью на эту тему.

Второй этап программы запланирован на апрель–май 2026 года и дополнительно охватит Рустави, Зугдиди и Телави. Организаторы также готовят онлайн-курс, который будет доступен из любой точки Грузии.`,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 53).toISOString(),
  },
];

const memorySubmissions: NewsSubmissionRecord[] = [];

declare global {
  var __newsTablesUnavailable: boolean | undefined;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toExcerpt(value: string) {
  return value.trim().slice(0, 180);
}

async function ensureNewsTables() {
  if (!hasDatabase) return false;
  if (global.__newsTablesUnavailable) return false;

  if (global.__newsTablesUnavailable === undefined) {
    try {
      const rows = (await db.$queryRawUnsafe(
        "select to_regclass('public.\"NewsArticle\"')::text as article_table, to_regclass('public.\"NewsSubmission\"')::text as submission_table",
      )) as Array<{ article_table: string | null; submission_table: string | null }>;
      const row = rows?.[0];
      global.__newsTablesUnavailable = !(row?.article_table && row?.submission_table);
    } catch {
      global.__newsTablesUnavailable = true;
    }
  }

  return !global.__newsTablesUnavailable;
}

/** Runs once per request; re-syncs seed rows from code (e.g. imageUrl) so DB matches `seededNews` after edits. */
const syncNewsSeedToDatabase = cache(async () => {
  const hasTables = await ensureNewsTables();
  if (!hasTables) return;
  try {
    for (const seed of seededNews) {
      await (db as any).newsArticle.upsert({
        where: { slug: seed.slug },
        update: {
          scope: seed.scope,
          imageUrl: seed.imageUrl,
          sourceName: seed.sourceName,
          sourceUrl: seed.sourceUrl,
          titleKa: seed.title.ka,
          titleEn: seed.title.en,
          titleRu: seed.title.ru,
          excerptKa: seed.excerpt.ka,
          excerptEn: seed.excerpt.en,
          excerptRu: seed.excerpt.ru,
          bodyKa: seed.body.ka,
          bodyEn: seed.body.en,
          bodyRu: seed.body.ru,
          isPublished: true,
        },
        create: {
          slug: seed.slug,
          scope: seed.scope,
          imageUrl: seed.imageUrl,
          sourceName: seed.sourceName,
          sourceUrl: seed.sourceUrl,
          titleKa: seed.title.ka,
          titleEn: seed.title.en,
          titleRu: seed.title.ru,
          excerptKa: seed.excerpt.ka,
          excerptEn: seed.excerpt.en,
          excerptRu: seed.excerpt.ru,
          bodyKa: seed.body.ka,
          bodyEn: seed.body.en,
          bodyRu: seed.body.ru,
          isPublished: true,
          createdAt: new Date(seed.createdAt),
        },
      });
    }
  } catch {
    global.__newsTablesUnavailable = true;
  }
});

async function ensureNewsSeedData() {
  await syncNewsSeedToDatabase();
}

function mapNewsArticle(row: any): NewsArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    scope: row.scope as NewsScope,
    imageUrl: row.imageUrl ?? undefined,
    sourceName: row.sourceName ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    title: { ka: row.titleKa, en: row.titleEn, ru: row.titleRu },
    excerpt: { ka: row.excerptKa, en: row.excerptEn, ru: row.excerptRu },
    body: { ka: row.bodyKa, en: row.bodyEn, ru: row.bodyRu },
    isPublished: Boolean(row.isPublished),
    createdAt: row.createdAt.toISOString(),
  };
}

function mapNewsSubmission(row: any): NewsSubmissionRecord {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.imageUrl ?? undefined,
    sourceName: row.sourceName ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    scope: row.scope as NewsScope,
    status: row.status as NewsSubmissionStatus,
    adminNote: row.adminNote ?? undefined,
    createdAt: row.createdAt.toISOString(),
    submitterUsername: row.submitter?.username ?? undefined,
  };
}

function listPublishedNewsFromMemory(): NewsArticleRecord[] {
  return seededNews
    .map((entry, index) => ({
      ...entry,
      id: `seed-news-${index + 1}`,
      isPublished: true,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listPublishedNews(scope?: NewsScope): Promise<NewsArticleRecord[]> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) {
    const fallback = listPublishedNewsFromMemory();
    return scope ? fallback.filter((entry) => entry.scope === scope) : fallback;
  }

  await ensureNewsSeedData();
  const rows = await (db as any).newsArticle.findMany({
    where: { isPublished: true, ...(scope ? { scope } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapNewsArticle);
}

export async function listNewsSlugs(): Promise<string[]> {
  const items = await listPublishedNews();
  return items.map((entry) => entry.slug);
}

export const getNewsBySlug = cache(
  async (slug: string): Promise<NewsArticleRecord | null> => {
    const hasTables = await ensureNewsTables();
    if (!hasTables) {
      return listPublishedNewsFromMemory().find((entry) => entry.slug === slug) ?? null;
    }
    await ensureNewsSeedData();
    const row = await (db as any).newsArticle.findUnique({
      where: { slug },
    });
    if (!row || !row.isPublished) return null;
    return mapNewsArticle(row);
  },
);

export async function submitNews(input: {
  title: string;
  body: string;
  scope: NewsScope;
  submitterId?: string;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
}): Promise<NewsSubmissionRecord> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) {
    const record: NewsSubmissionRecord = {
      id: `local-sub-${Date.now()}`,
      title: input.title.trim(),
      body: input.body.trim(),
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || undefined,
      sourceName: input.sourceName?.trim() || undefined,
      sourceUrl: input.sourceUrl?.trim() || undefined,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    memorySubmissions.unshift(record);
    return record;
  }

  await ensureNewsSeedData();
  const row = await (db as any).newsSubmission.create({
    data: {
      title: input.title.trim(),
      body: input.body.trim(),
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || null,
      sourceName: input.sourceName?.trim() || null,
      sourceUrl: input.sourceUrl?.trim() || null,
      submitterId: input.submitterId ?? null,
    },
    include: { submitter: { select: { username: true } } },
  });

  return mapNewsSubmission(row);
}

export async function listAdminNewsData(): Promise<{
  articles: NewsArticleRecord[];
  submissions: NewsSubmissionRecord[];
}> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) {
    return {
      articles: listPublishedNewsFromMemory(),
      submissions: [...memorySubmissions].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    };
  }

  await ensureNewsSeedData();
  const [articles, submissions] = await Promise.all([
    (db as any).newsArticle.findMany({ orderBy: { createdAt: "desc" } }),
    (db as any).newsSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: { submitter: { select: { username: true } } },
    }),
  ]);

  return {
    articles: articles.map(mapNewsArticle),
    submissions: submissions.map(mapNewsSubmission),
  };
}

export async function createNewsArticleByAdmin(input: {
  scope: NewsScope;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  body: Record<Locale, string>;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  isPublished?: boolean;
  actorUserId: string;
}): Promise<NewsArticleRecord> {
  const hasTables = await ensureNewsTables();
  const baseSlug = normalizeSlug(input.title.en || input.title.ka || input.title.ru || "news");

  if (!hasTables) {
    return {
      id: `local-news-${Date.now()}`,
      slug: `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`,
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || undefined,
      sourceName: input.sourceName?.trim() || undefined,
      sourceUrl: input.sourceUrl?.trim() || undefined,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      isPublished: input.isPublished ?? true,
      createdAt: new Date().toISOString(),
    };
  }

  await ensureNewsSeedData();
  let slug = baseSlug;
  let attempt = 0;
  while (await (db as any).newsArticle.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const row = await (db as any).newsArticle.create({
    data: {
      slug,
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || null,
      sourceName: input.sourceName?.trim() || null,
      sourceUrl: input.sourceUrl?.trim() || null,
      titleKa: input.title.ka.trim(),
      titleEn: input.title.en.trim(),
      titleRu: input.title.ru.trim(),
      excerptKa: input.excerpt.ka.trim(),
      excerptEn: input.excerpt.en.trim(),
      excerptRu: input.excerpt.ru.trim(),
      bodyKa: input.body.ka.trim(),
      bodyEn: input.body.en.trim(),
      bodyRu: input.body.ru.trim(),
      isPublished: input.isPublished ?? true,
      createdById: input.actorUserId,
      reviewedById: input.actorUserId,
    },
  });
  return mapNewsArticle(row);
}

export async function updateNewsArticleByAdmin(input: {
  id: string;
  scope?: NewsScope;
  title?: Record<Locale, string>;
  excerpt?: Record<Locale, string>;
  body?: Record<Locale, string>;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  isPublished?: boolean;
  actorUserId: string;
}): Promise<NewsArticleRecord | null> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) return null;

  await ensureNewsSeedData();
  const updated = await (db as any).newsArticle.update({
    where: { id: input.id },
    data: {
      scope: input.scope,
      imageUrl: input.imageUrl?.trim() || undefined,
      sourceName: input.sourceName?.trim() || undefined,
      sourceUrl: input.sourceUrl?.trim() || undefined,
      titleKa: input.title?.ka.trim(),
      titleEn: input.title?.en.trim(),
      titleRu: input.title?.ru.trim(),
      excerptKa: input.excerpt?.ka.trim(),
      excerptEn: input.excerpt?.en.trim(),
      excerptRu: input.excerpt?.ru.trim(),
      bodyKa: input.body?.ka.trim(),
      bodyEn: input.body?.en.trim(),
      bodyRu: input.body?.ru.trim(),
      isPublished: input.isPublished,
      reviewedById: input.actorUserId,
    },
  });
  return mapNewsArticle(updated);
}

export async function reviewSubmissionByAdmin(input: {
  submissionId: string;
  action: "APPROVE" | "REJECT";
  actorUserId: string;
  adminNote?: string;
  publishEdits?: {
    scope?: NewsScope;
    imageUrl?: string;
    sourceName?: string;
    sourceUrl?: string;
    title?: Partial<Record<Locale, string>>;
    body?: Partial<Record<Locale, string>>;
    excerpt?: Partial<Record<Locale, string>>;
  };
}): Promise<{ submission: NewsSubmissionRecord; article?: NewsArticleRecord }> {
  const hasTables = await ensureNewsTables();
  if (!hasTables) {
    const index = memorySubmissions.findIndex((entry) => entry.id === input.submissionId);
    if (index === -1) {
      throw new Error("Submission not found");
    }
    const current = memorySubmissions[index];
    const nextStatus: NewsSubmissionStatus = input.action === "APPROVE" ? "APPROVED" : "REJECTED";
    const updated = {
      ...current,
      status: nextStatus,
      adminNote: input.adminNote || current.adminNote,
    };
    memorySubmissions[index] = updated;
    return { submission: updated };
  }

  await ensureNewsSeedData();
  const submission = await (db as any).newsSubmission.findUnique({
    where: { id: input.submissionId },
    include: { submitter: { select: { username: true } } },
  });
  if (!submission) throw new Error("Submission not found");

  if (input.action === "REJECT") {
    const updated = await (db as any).newsSubmission.update({
      where: { id: submission.id },
      data: {
        status: "REJECTED",
        adminNote: input.adminNote?.trim() || null,
        reviewedById: input.actorUserId,
      },
      include: { submitter: { select: { username: true } } },
    });
    return { submission: mapNewsSubmission(updated) };
  }

  const kaTitle = input.publishEdits?.title?.ka || submission.title;
  const [enTitle, ruTitle] = await Promise.all([
    autoTranslateText(input.publishEdits?.title?.en || kaTitle, "en"),
    autoTranslateText(input.publishEdits?.title?.ru || kaTitle, "ru"),
  ]);
  const kaBody = input.publishEdits?.body?.ka || submission.body;
  const [enBody, ruBody] = await Promise.all([
    autoTranslateText(input.publishEdits?.body?.en || kaBody, "en"),
    autoTranslateText(input.publishEdits?.body?.ru || kaBody, "ru"),
  ]);

  const kaExcerpt = input.publishEdits?.excerpt?.ka || toExcerpt(kaBody);
  const [enExcerpt, ruExcerpt] = await Promise.all([
    autoTranslateText(input.publishEdits?.excerpt?.en || kaExcerpt, "en"),
    autoTranslateText(input.publishEdits?.excerpt?.ru || kaExcerpt, "ru"),
  ]);

  const article = await createNewsArticleByAdmin({
    scope: input.publishEdits?.scope || submission.scope,
    imageUrl: input.publishEdits?.imageUrl || submission.imageUrl || undefined,
    sourceName: input.publishEdits?.sourceName || submission.sourceName || undefined,
    sourceUrl: input.publishEdits?.sourceUrl || submission.sourceUrl || undefined,
    title: { ka: kaTitle, en: enTitle.text, ru: ruTitle.text },
    excerpt: { ka: kaExcerpt, en: enExcerpt.text, ru: ruExcerpt.text },
    body: { ka: kaBody, en: enBody.text, ru: ruBody.text },
    isPublished: true,
    actorUserId: input.actorUserId,
  });

  const updatedSubmission = await (db as any).newsSubmission.update({
    where: { id: submission.id },
    data: {
      status: "APPROVED",
      adminNote: input.adminNote?.trim() || null,
      reviewedById: input.actorUserId,
    },
    include: { submitter: { select: { username: true } } },
  });

  await (db as any).newsArticle.update({
    where: { id: article.id },
    data: { submissionId: updatedSubmission.id },
  });

  return {
    submission: mapNewsSubmission(updatedSubmission),
    article,
  };
}

