'use strict'

;(function(){

    var container = $('.container'),
        taskList = $('.task-list',container),
        addTaskBtn = $('form button[type="submit"]',container),
        taskDetailPanel = $('.task-detail',container),
        taskDetailMask = $('.task-detail-mask',container),
        msgPanel = $('.msg',container),
        alertSound = $('.sound'),

        arrTaskList = null

    //入口
    init()
    addTaskBtn.bind('click', function (e) {
        e.preventDefault()
        addTask()
    })
    taskDetailMask.bind('click', function (e) {
        e.preventDefault()
        taskDetailMask.hide()
        taskDetailPanel.hide()
    })

    function init (){
        $.datetimepicker.setLocale('ch')
        refreshList()
        checkMsg()
    }

    //更新
    function refreshList(){
        //store.clear()
        taskList.html(null)
        arrTaskList = store.get('todoApp')||[]
        //console.log(arrTaskList)
        if(arrTaskList !== undefined && arrTaskList.length !== 0){
            console.log('任务数：',arrTaskList.length)
            renderList(arrTaskList)
        }
    }

    function renderList (){
        for(var i = 0;i <arrTaskList.length;i++){
            var r = getTaskTemplate(arrTaskList[i])
            taskList.append(r)
        }
        reBindEvent()
    }

    function getTaskTemplate (item) {
        var tpl = '<div class="task-item '+(item.complete?"completed":"")+'">'
            +'<span><input type="checkbox" '+(item.complete?" checked":"")+'></span>'
            +'<span class="task-content">'+item.content+'</span>'
            +'<span class="action">'
            +'<span class="del">删除</span>'
            +'<span class="dtl">详情</span>'
            +'</span>'
            +'</div>'
        return tpl
    }

    function checkMsg(){
        var interval
        if(interval){clearInterval(interval)}
        interval = setInterval(function () {
            //console.log('test')
            for(var i = 0 ; i < arrTaskList.length;i++){
                if(arrTaskList[i].date == undefined || arrTaskList[i].informed == true){continue}
                var now = new Date().getTime()
                var taskTime = new Date(arrTaskList[i].date).getTime()
                if( now >= taskTime){
                    showMsg(arrTaskList[i].content)
                    arrTaskList[i].informed = true
                    store.set('todoApp',arrTaskList)
                }
            }
        },500)
    }

    function showMsg(msg){
        if(msg === undefined || msg == ''){return}
        $('.info',msgPanel).text(msg)
        msgPanel.show()
        alertSound.get(0).play()
        $('button',msgPanel).bind('click',function(){
            msgPanel.hide()
        })
    }

    function addTask (){
        var item = {}
        item.content = $('form input',container).val()
        saveTask(item)
        refreshList()
        $('form input',container).val(null)
    }

    function saveTask (newItem){
        arrTaskList.unshift(newItem)
        store.set('todoApp',arrTaskList)
    }

    function reBindEvent(){
        var delTaskBtn = $('span.del',container),
            dtlTaskBtn = $('span.dtl',container),
            checkBtn = $('input[type=checkbox]',container)
        //删除task
        delTaskBtn.unbind('click').bind('click',function(e){
            e.preventDefault()
            var $this = $(this)
            var r = confirm("Sure?")
            if(r){
                delTask(delTaskBtn.index($this))
            }
        })
        //task详情
        dtlTaskBtn.unbind('click').bind('click',function(e){
            e.preventDefault()
            var $this = $(this)
            showDetailPanel(dtlTaskBtn.index($this))
        })
        //check任务
        checkBtn.unbind('click').bind('click',function(e){
            var $this = $(this)
            var state = this.checked
            checkTask(checkBtn.index($this),state)
        })
    }

    function delTask(index){
        arrTaskList.splice(index,1)
        store.set('todoApp',arrTaskList)
        refreshList()
    }

    function showDetailPanel(taskIndex){
        if(taskIndex == undefined || !arrTaskList[taskIndex]){
            return
        }
        renderDetailPanel(taskIndex)
        taskDetailPanel.show()
        taskDetailMask.show()
    }

    function renderDetailPanel(tIndex){
        var currentTask = arrTaskList[tIndex]
        var tpl = '<form>'+
            '<div class="content input-item">'+(currentTask.content!==undefined?currentTask.content:"")+'</div>'+
            '<div class="modify input-item"><input type="text" value="'+(currentTask.content!==undefined?currentTask.content:"")+'"></div>'+
                '<div>'+
                    '<div class="desc input-item">'+
                        '<textarea rows="3" cols="30" name="note">'+(currentTask.note!==undefined?currentTask.note:"")+'</textarea>'+
                    '</div>'+
                '</div>'+
            '<div class="remind input-item">'+
                '<input class="date" type="text" name="date">'+
            '</div>'+
            '<button type="submit">提交</button>'
            '</form>'
        taskDetailPanel.html(tpl)
        $('input.date',taskDetailPanel).datetimepicker({format:'Y-m-d H:i',value:currentTask.date})
        var submitBtn = $('button[type="submit"]',taskDetailPanel)
        var contentDiv = $('.content',taskDetailPanel)
        var modifyDiv = $('.modify',taskDetailPanel)
        var form = $('form',taskDetailPanel)
        submitBtn.bind('click',function(e){
            e.preventDefault()
            var newContent = {
                content:$('.modify input',form).val(),
                note:$('[name=note]',form).val(),
                date:$('.date',form).val()
            }
            updateTask(tIndex,newContent)
            taskDetailPanel.hide()
            taskDetailMask.hide()
        })
        contentDiv.bind('dblclick',function(e){
            e.preventDefault()
            modifyDiv.show()
            contentDiv.hide()
        })
    }

    function checkTask (tIndex,state){
        $.extend(arrTaskList[tIndex],{"complete":state})
        if(state){
            completeTask(tIndex)
        }else{
            resumeTask(tIndex)
        }
    }

    function completeTask(tIndex){
        $('.task-item',taskList).eq(tIndex).addClass('completed')
        arrTaskList.push(arrTaskList.splice(tIndex,1)[0])
        store.set('todoApp',arrTaskList)
        refreshList()
    }

    function resumeTask(tIndex){
        $('.task-item',taskList).eq(tIndex).removeClass('completed')
        arrTaskList.unshift(arrTaskList.splice(tIndex,1)[0])
        store.set('todoApp',arrTaskList)
        refreshList()
    }

    function updateTask(tIndex,newContent){
        arrTaskList.splice(tIndex,1,newContent)
        store.set('todoApp',arrTaskList)
        refreshList()
    }
})()