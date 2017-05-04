var result = false;

document.addEventListener("DOMContentLoaded", refreshResult);

function play()
{
    if($('#command_text').val().replace(/^\s+|\s+$/g, '') == '')
    {
       $.notify("Введите команду!", {globalPosition: 'top center',className: 'error',autoHideDelay: 2000});
       return;
    }
    var data = {};
		data.command = $('#command_text').val();
    data.comment = $('#comment_text').val();

    $.ajax({
      type: 'POST',
      url: '/play',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(data) {
         
        jQuery('#play_utility_form')[0].reset();
        if(result)
        {
          result.jqxGrid('destroy');
          result = false;
        }
        
        resultTable(data);
        $.notify("Утилита успешно запушена", {globalPosition: 'top center',className: 'success',autoHideDelay: 2000});

      },
      error:  function(xhr, str){
        $.notify("Произошла ошибка", {globalPosition: 'top center',className: 'error',autoHideDelay: 2000});
      }
    });
}

function resultTable(data)
{
  console.log(result);
   var source ={
      datatype: "json",
      datafields: [
          { name: 'command', type: 'string' },
          { name: 'comment', type: 'string' },
          { name: 'param', type: 'string' },
          { name: 'id_status', type: 'string' },
          { name: 'name_status', type: 'string' },
          { name: 'result', type: 'string' },
          { name: 'time_start', type: 'string' },
          { name: 'time_end', type: 'string' },
      ],
      localdata: data
  };

  var initrowdetails = function (index, parentElement, gridElement, datarecord) {
    var panel = null;
    var res = null;
    panel = $($(parentElement).children()[0]);
    if (panel != null) {
        res = panel.find('.result');
        var res_container = $('<div style="white-space: normal; margin: 5px;"><span style="font-family: Consolas, monaco, monospace;">' + datarecord.result + '</span></div>');
        $(res).append(res_container);
        $(panel).jqxPanel({ width: "96%", height: "90%"});
    }
  }
  var status = function (row, datafield, value,cell_html,cell,obj) 
  {
      var span;
      switch(obj.id_status)
      {
        case  1: span = "<span style='' class='label green'>"+value+"</span>";  break;
        case  2: span = "<span style='' class='label yellow'>"+value+"</span>";  break;
        case  3: span = "<span style='' class='label red'>"+value+"</span>";  break;
      }

        return "<div style='margin-top: 8px;margin-left: 3px;'>"+span+"</div>";
  }
  var dataAdapter = new $.jqx.dataAdapter(source);
  $("#result_place").append('<div id="result_table"></div>');
  result = $("#result_table").jqxGrid(
  {
      width: '99%',
      source: dataAdapter,
      columnsresize: true,
      theme:"bootstrap",
      rowdetails: true,
      sortable: true,
      pageable: true,
      localization: getLocalization('ru'),
      rowdetailstemplate: { rowdetails: "<div style='margin: 10px;'><h5>Результат</h5><div class='result'></div></div>", rowdetailsheight: 200, rowdetailshidden: true },
      pagesize: 10,
      initrowdetails: initrowdetails,
      showtoolbar: true,
       rendertoolbar: function (toolbar) {
          var container = $("<div style='margin-top: 2px;'></div>");
          var span = $("<button class='btn btn-primary' type='button' style='height:30px; float:right;' onclick='refreshResult();' ><i class='glyphicon glyphicon-refresh'></i> Обновить</button>");
          toolbar.append(container);
          container.append(span);

      },
      columns: [
        { text: 'Команда', datafield: 'command', width: '20%' },
        { text: 'Параметры', datafield: 'param', width: '20%' },
        { text: 'Комментарий', datafield: 'comment', width: '25%' },
        { text: 'Статус', datafield: 'name_status', width: '9%',  cellsrenderer: status},
        { text: 'Время начала', datafield: 'time_start', minwidth: '10%' },
        { text: 'Время конца', datafield: 'time_end', minwidth: '10%' }
    ]
  });   
}

function refreshResult()
{
  $.ajax({
        url: '/refresh',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: {},
        success: function(data){
          if(result)
          {
            result.jqxGrid('destroy');
            result = false;
          }
          resultTable(data);
        }
    });
}