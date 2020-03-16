/**
 * Created by 59308 on 2019/1/7 0007.
 */
$("ul#user").on("click","li",function(){      //只需要找到你点击的是哪个ul里面的就行

    alert($(this).text());
});