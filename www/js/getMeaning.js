var EitangoFetcher = function(){

	this.SOURCE_WEBLIO = "weblio";

	/* 
		return object:
		{
			word
			meaning
			from_where
		}

		デ辞蔵のヘッダ検索の場合
		[
			{
				word
				id
			}
			...
		]

		ただし、エラーの場合に返却されるオブジェクトは以下
		{
			is_error: trueならエラー
		}
	 */
};

//weblioから取得する場合
(function(proto){

	/* public method!! */
	/* 
		weblioから単語の意味を取得し、規定のオブジェクトとして返却する
	*/
	proto.getTangoFromWeblio = function(word){
		searchEitango(word, function(obj){
			return obj;
		});
	};

	/* 取得した英単語の意味をの必要な部分だけ抽出 */
	function extractMeaningFromWeblio(data){
		var meaning_parts = data.querySelectorAll(".level0");

		var return_string = "";

		if(meaning_parts && (meaning_parts.length > 0)){
			jQuery.each(meaning_parts, function(i, val){

				var el_children = val.childNodes;

				for(var i = 0; i < el_children.length; i++){
					if(!el_children[i] || !el_children[i].getAttribute){
						continue;
					}

					switch(el_children[i].getAttribute("class")){
						case "lvlNH":
							return_string += el_children[i].innerHTML + " ";
							break;
						case "lvlAH":
							return_string += el_children[i].innerHTML + " ";
							break;
						case "lvlB":
							return_string += el_children[i].innerHTML.replace(/<a [^>]*>|<\/a>/g, "") + "<br>";
							//console.log("in extractMeaningFromWeblio, switch, replace: " + el_children[i].innerHTML.replace(/<a [^>]*>|<\/a>/g, ""));
							break;
						case "clr":
							break;
						default:
							return_string += el_children[i].innerHTML;
							break;
					}
				}

				return_string = return_string.replace(/<!--\/?[a-zA-Z_]+-->/g, "");

				console.log("in extractMeaningFromWeblio, return_string is:" + return_string);
			});
		}

		return return_string;
	}

	function parseEitangoData(word, data){
		var dom_parser = new DOMParser();
		var got_html_document = null;

		var err_obj = {is_error: true};

		try{
			got_html_document = dom_parser.parseFromString(data, "text/html");

			//parseに失敗した場合...
			if(got_html_document.getElementsByTagName("parsererror").length > 0){
				got_html_document = null;
			}

			if(got_html_document == null){ return err_obj }

			if(got_html_document.querySelector("#nrCntTH")){ return err_obj }

			var el_meaning_section = got_html_document.querySelector(".hideDictPrs .kiji");

			if(!el_meaning_section){ return err_obj }

			return {
				word: word,
				meaning: extractMeaningFromWeblio(el_meaning_section),
				from_where: "weblio"
			};
		}
		catch(e){
			console.log(e);

			return err_obj;
		}
	}

	/* 英単語の意味を検索 */
	function searchEitango(word, callback){
		jQuery.ajax({
			type: "GET",
			url: "search_eitango.php",
			dataType: "html",
			data:{
				word: el_word.value
			},
			success: function(data){
				console.log("ajax success!!");

				/*
				callbackには、object{
					word,
					meaning,
					from_where
				}
				が渡されて実行される
				*/
				callback(parseEitangoData(word, data));

				return;
			},
			error: function(data){
				alert("ajaxで通信エラーが発生しました(" + data + ")");
			}
		});
	}
})(EitangoFetcher.prototype);






//デ辞蔵から取得する場合
(function(proto){
	/* public method!! */
	/* 
		デ辞蔵から検索語-ID紐づけオブジェクトを取得する
	*/
	proto.getDejizoWordList = function(word, dic_pref, word){

	};

	/* public method!! */
	/* 
		デ辞蔵からidをもとに単語の意味情報を取得する
	*/
	proto.getDejizoContent = function(id){

	}

})(EitangoFetcher.prototype);



/*
サービスの稼働URL
無償公開用　　http://public.dejizo.jp/NetDicV09.asmx

無償公開サービスのURLです。365日24時間動作していますが稼働保証はございません。
本運用のサービスは多重化されたサーバで常時稼動させています。商用サービスのURLは契約にしたがって開示させていただいております。

メソッド
メソッドは「検索メソッド」と「内容取得メソッド」の二つです。 パラメータは、URL の最後につける Query String で指定します。 出力は SOAP と同じ XML形式です。

検索メソッド
■リクエストURL

http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite?パラメータ名=パラメータ値&パラメータ名=パラメータ値…

■リクエストパラメータ

不要なパラメータでも省略はできません。 
パラメータ名	説明
Dic	辞書ID 
辞書名	辞書ID
EJDict英和辞典	EJdict
Edict和英辞典	EdictJE
ウィキペディア日本語版	wpedia

商用の辞書の辞書IDは契約にしたがってお知らせします。
Word	検索語
（ UTF-8 文字列をURL encoding したものです。
日本語の場合、
「%E3%83%86%E3%83%AD＝テロ」
「%E6%A0%AA＝株」
といった文字列になります。）
Scope	検索対象（見出し語 or 全文） の指定（HEADWORD/ANYWHERE）
Match	一致指定　前方・後方・部分・完全
Merge	複数条件指定時の結合方法指定 (AND/OR)
Prof	コンテンツ形式指定（例： XHTML ）
PageSize	一度に取得する検索結果の数
PageIndex	取得する検索結果の開始位置
（PageSize*指定値が開始インデックス：通常は０）
■戻りのXMLデータの例
<?xml version="1.0" encoding="utf-8"?>
<SearchDicItemResult xmlns:xsd="  ・・・・・・・・・・
  <ErrorMessage />
  <TotalHitCount>1</TotalHitCount>
  <ItemCount>1</ItemCount>
  <TitleList>
    <DicItemTitle>
      <ItemID>0001360</ItemID>
      <LocID />
      <Title>
        <span class="NetDicTitle" xmlns="">
          <b>ab･sent</b>
        </span>
      </Title>
    </DicItemTitle>
    <DicItemTitle>
      <ItemID>0001380</ItemID>
      <LocID />
      <Title>
        <span class="NetDicTitle" xmlns="">
          <b>ab･sen･tee</b>
        </span>
      </Title>
    </DicItemTitle>
	・・・・・
	・・・・・
    <DicItemTitle>
      <ItemID>0001420</ItemID>
      <LocID />
      <Title>
        <span class="NetDicTitle" xmlns="">
          <b>ab･sent-mind･ed</b>
        </span>
      </Title>
    </DicItemTitle>
  </TitleList>
</SearchDicItemResult>
      
■戻りのXMLのタグ

タグ名	説明
ErrorMessage	エラーの場合のエラーメッセージ
TotalHitCount	総ヒット数
ItemCount	この呼び出しで返される項目数
TitleList	この配下に<DicItemTitle>が複数並ぶ
DicItemTitle	ひとつの項目をまとめるタグ
ItemID	項目のID
LocID	項目内の注目位置ID（特別な辞書を除き、常に空要素）
Title	検索結果一覧表示用の XHTML データ
（直下にある <span> タグ以下をそのまま見出しとして HTMLページにはめ込むことを想定しています。）
■リクエスト例

EJDICT英和辞典で「dict」を前方一致で検索した場合のリクエストURLです。

http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite?
Dic=EJdict&Word=dict&Scope=HEADWORD&Match=
STARTWITH&Merge=AND&Prof=XHTML&PageSize=20&PageIndex=0
 


内容取得メソッド
■リクエストURL

http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite?パラメータ名=パラメータ値&パラメータ名=パラメータ値…

■リクエストパラメータ

不要なパラメータでも省略はできません。

パラメータ名	説明
Dic	辞書ID (例：　DailyEJ, DailyJE, DailyJJ など )
Item	辞書項目のID（検索method で返される値です）
Loc	辞書項目内の注目位置（特別な辞書を除き、指定は不要）
Prof	コンテンツ形式指定（通常は XHTML）

■戻りのXMLデータの例

<?xml version="1.0" encoding="utf-8"?>
<GetDicItemResult xmlns:xsd="  ・・・・・・・・・・
  <ErrorMessage />
  <Head>
    <div class="NetDicHead" xml:space="preserve" xmlns="">
      <b>ab･sent</b>
	・・・・・
	・・・・・
    </div>
  </Head>
  <Body>
    <div class="NetDicBody" xml:space="preserve" xmlns="">
      <br /> 
      ━━ a.　不在の，欠席の； ない； ぼんやりした． 
      <br /> 
      <br /> 
      ━━ ［absent］ vt. 
      <br /> 
	・・・・・
	・・・・・
    </div>
  </Body>
</GetDicItemResult>

■戻りのXMLのタグ

タグ名	説明
ErrorMessage	エラーの場合のエラーメッセージ
Head	「見出し」表示用の XHTML データ
Body	「本文」表示用の XHTML データ
（ Head, Body とも、直下にある <div> タグ以下をそのまま見出しや本文 として HTMLページにはめ込むことを想定しています。）
■リクエスト例

EJDICT英和辞典で「dict」を前方一致で検索した場合のリクエストURLです。

http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite?Dic=EJdict
&Item=011357&Loc=&Prof=XHTML
 


項目内リンクの処理について
<Title><Head><Body>の配下の要素として返される XHTMLデータは、
ブラウザ依存などがないような、極力シンプルなものになっており、
そのままHTMLのページにはめ込んで頂くことを想定しています。
ただし、一点だけ加工処理が必要なところがあります。
本文内に他の辞書項目を参照するようなリンクが埋め込まれている 場合です。

これは、以下のような形になっています。
--------------------------------------------------------------------------
<span class="NetDicItemLink" ItemID="01010340">→「デル・モデル」</span>
--------------------------------------------------------------------------
「NetDicItemLink」は固定値で、「ItemID」が参照先の辞書項目IDです。
「他項目リンク」をサポートしないのであれば、何もしなくてもただの文字列として 表示されるようになっています。

「他項目リンク」をサポートする場合は、「class="NetDicItemLink"」をキーに してこのようなspan要素を探していただき、それを加工していただくことになります。
どう加工すればよいかは表示ページの実装によります。
例えば、
--------------------------------------------------------------------------
<a href="DicItemView?item=01010340">→「デル・モデル」</a>
--------------------------------------------------------------------------
<a href="javascript:ChangeItem('01010340')">→「デル・モデル」</a> 
--------------------------------------------------------------------------
といった形がよくある実装例です。


*/