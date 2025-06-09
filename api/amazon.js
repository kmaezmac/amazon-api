const AmazonPaapi = require('amazon-paapi');
require('dotenv').config();

const nodes = [
"2151981051", //ノートパソコン
  "2422738051", //コーヒー・紅茶・お茶・粉末ドリンク
  "71589051", //ビール・発泡酒
  "71443051", //水・ミネラルウォーター
  "2221074051", //メンズバッグ・財布
  "2221070051", //メンズシューズ
  "2131417051", //メンズ服＆ファッション小物
  "2221071051", //レディースシューズ
  "2131478051", //レディース服
  "5519723051", //レディースジュエリー
  "5267102051", //ヘアケア・カラー・スタイリング
  "5267100051", //スキンケア・ボディケア
  "169911011", //衛生用品・ヘルスケア
  "4159907051", //コンタクトレンズ・メガネ
  "170563011", //日用品
  "124048011", //家電
  "16428011", //家具
  "13938521", //食器・グラス・カトラリー
  "13938481", //キッチン用品
  "13945171", //バス・トイレ・洗面用品
  "2378086051", //寝具
  "2127212051", //ペット用品
  "160384011", //ドラッグストア
  "2188762051", //パソコン
  "2151982051", //ディスプレイ
  "2151996051", //無線・有線LANルーター
  "2152014051", //タブレット
  "6747004051", //ゲーミングパソコン
  "2151978051", //マウス
  "2151977051", //パスコン用キーボード
  "333009011", //メンズ腕時計
  "344845011", //ベビー＆マタニティ
  "561958", //DVD
  "562020", //アニメ
  "637394", //ゲーム
  "13299531", //おもちゃ
  "2277721051", //ホビー
  "2123629051", //楽器・音響機器
  "680359011", //男性アイドル
  "2408695051", //Amazonデバイス
  "2275256051", //Kindle本
  "637644", //ビジネス・オフィス用ソフト
  "637666", //オペレーティングシステム
  "689132", //PCゲーム
  "2189604051", //カードゲーム・トランプ
  "14315441", //ゴルフ
  "14315411", //アウトドア洋品
  "14315451", //サッカー・フットサル用品
  "87805051", //野球用品
  "14315521", //釣り
  "2201158051", //登山・クライミング用品
  "14315501", //フィットネス・トレーニング
  "2129358051", //J-POP
  "2129364051", //ヒップホップ
  "13945061", //インテリア
  "10391353051", //プラモデル・模型
  "3113755051", //アイドル・芸能人グッズ
  "2189388051", //アニメ・萌えグッズ
  "2189356051", //フィギュア・コレクタードール
  "2130105051", //カラオケ機器
  "89088051", //筆記具
  "89084051", //オフィス家具・収納
  "89086051", //オフィス機器
  "2496781051", //デジタル文具
  "89085051", //ノート・紙製品
  "3187998051", //ファイル・バインダー
  "89083051", //事務用品
  "89202051", //印鑑・スタンプ
  "89087051", //学習用品
  "89089051", //封筒・はがき・レター用品
  "89090051", //手帳・カレンダー
  "89443051", //梱包材
  "13384021", //雑誌
  "466296", //エンターテイメント
  "2748677051", //カレンダー
  "466298", //コンピュータ・IT
  "500592", //タレント写真集
  "492152", //ノンフィクション
  "466282", //ビジネス・経済
  "492054", //投資・金融・会社経営
  "3148931", // 教育・学参・受験
  "466290", //科学・テクノロジー
  "466302", //語学・辞事典・年鑑
  "492228", //資格・検定
  "2045111051", //洗車・お手入れ用品
  "2045022051", //カーアクセサリ
  "2129987051", //ピアノ・キーボード
  "2130095051", //DJ機材
  "2129862051", //ギター
];

function onSuccess(data) {
  if (!data.SearchResult || !data.SearchResult.Items) return [];
  return data.SearchResult.Items.map(item => {
    const price = item.Offers?.Listings?.[0]?.Price?.Amount || 0;
    const savings = item.Offers?.Listings?.[0]?.Savings?.Amount || 0;
    const percentage = item.Offers?.Listings?.[0]?.Savings?.Percentage || 0;
    const url = item.DetailPageURL || "";
    const title = item.ItemInfo?.Title?.DisplayValue || "";
    return { price, savings, percentage, url, title };
  });
}

function onError(error) {
  console.error(error);
}

module.exports = async (req, res) => {
  const { AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG, AMAZON_HOST } = process.env;

  const commonParameters = {
    AccessKey: AMAZON_ACCESS_KEY,
    SecretKey: AMAZON_SECRET_KEY,
    PartnerTag: AMAZON_PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: AMAZON_HOST || 'www.amazon.co.jp'
  };

  // ランダムなBrowseNodeIdを選択し、キーワードなしでリクエスト
  const searchItemsRequest = {
    SearchIndex: 'All',
    ItemCount: 10,
    BrowseNodeId: nodes[Math.floor(Math.random() * nodes.length)]
  };

  try {
    const data = await AmazonPaapi.SearchItems(commonParameters, searchItemsRequest);
    const responses = onSuccess(data);
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    if (
      !randomResponse ||
      randomResponse.percentage === undefined ||
      !randomResponse.url ||
      !randomResponse.title
    ) {
      res.status(404).json({ error: 'No valid item found' });
      return;
    }

    // percentageが0のときは割引率表示を消す
    const discountText = randomResponse.percentage > 0 ? `【${randomResponse.percentage}%オフ】 ` : "";
    const tweetText = `${discountText}${randomResponse.url} ${randomResponse.title.substring(0, 90)} #タイムセール #Amazon #PR`;
    res.json({ tweetText });
  } catch (err) {
    onError(err);
    res.status(500).json({ error: err.message });
  }
};