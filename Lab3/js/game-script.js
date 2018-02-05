$(document).ready(() => {
    const HOME = 0
    const PLAY = 1
    const END = 2

    var score = 0
    var totalTime = 0

    var changeMode = (val) => {
        $('#game-home').hide()
        $('#game-play').hide()
        $('#game-end').hide()
        switch (val) {
            case HOME:
                $('#game-home').show()
                $('.start-button').click((e)=>{
                    $('.start-button').off('click')
                    changeMode(PLAY)
                    quizzes = loadQuizzes()
                    shuffle(quizzes)
                    quizzes = quizzes.slice(0, e.target.dataset.set)
                    startQuiz(quizzes)
                })
                break
            case PLAY:
                $('#game-play').show()
                break
            case END:
                $('#game-end').show()
                $('#game-end').html(
                    `<div>Your Score: ` + score + `</div>` +
                    `<div>Total time: ` + totalTime + `</div>` +
                    `<div id="go-home-button">กลับหน้าแรก</div>`
                )
                $('#go-home-button').click(()=>{
                    changeMode(HOME)
                })
                break
        }
    }

    var loadQuizzes = (quizzes)=>{
        return $.ajax({
            url: 'data/quizzes.json',
            method: 'GET',
            dataType: 'json',
            async: false
        }).responseJSON
    }
    
    var startQuiz = (quizzes)=>{
        const CHOICE = 0
        const MULTIPLE = 1
        const TEXT = 2
        let answer = []
        let time = 10
        $('#time-left').text(time)
        $('#score').text(score)
        $('#quiz-name').html('')
        $('#quiz-pic').html('')
        $('#quiz-choices').html('')
        $('#your-answer input').val('')
        $('#quiz-result').text('')
        $('#answer-box').prop('disabled', true)
        $('#answer-box').off('change')
        if (quizzes.length == 0) {
            changeMode(END)
            return
        }

        let currentQuiz = quizzes[0]
        $('#quiz-name').html(currentQuiz.name)
        if (currentQuiz.type == MULTIPLE) {
            $('#quiz-name').append(' (ตอบได้หลายตัวเลือก ต้องตอบให้ถูกทั้งหมดจึงจะได้คะแนน)')
        }
        if (currentQuiz.picture) 
            $('#quiz-pic').html("<img src='"+currentQuiz.picture+"' height='200px' />")
        if (currentQuiz.type == CHOICE || currentQuiz.type == MULTIPLE) {
            let choicesText = ""
            shuffle(currentQuiz.choices)
            for (let i = 0; i < currentQuiz.choices.length; i++) {
                const element = currentQuiz.choices[i]
                choicesText += `<div class="choice" data-set="` + element.value + `">`
                if (element.pic)
                    choicesText += `<img src="` + element.pic + `" class="choice-pic" />`
                if (element.value)
                    choicesText += element.value
                choicesText += `</div>`
            }
            $('#quiz-choices').html(choicesText)
        } else if (currentQuiz.type == TEXT) {
            $('#answer-box').prop('disabled', false)
            $('#answer-box').change(()=>{
                answer = [$('#answer-box').val().replace(/ /g, "").toLowerCase()]
            })
        }
        if (currentQuiz.type == MULTIPLE) {
            $('.choice').addClass('multiple')
        }

        $('.choice.multiple').click((e)=>{
            let choice = e.target
            if (e.target.nodeName=="IMG") choice = choice.parentElement
            if (choice.classList.contains('selected')) {
                choice.classList.remove('selected')
                answer.splice(answer.indexOf(choice.dataset.set), 1)
            } else {
                choice.classList.add('selected')
                answer.push(choice.dataset.set)
            }
            $('#your-answer input').val(answer)
        })
    
        $('.choice:not(.multiple)').click((e)=>{
            let choice = e.target
            if (e.target.nodeName=="IMG") choice = choice.parentElement
            for (const child of choice.parentElement.children) {
                child.classList.remove('selected')
                answer = []
            }
            choice.classList.add('selected')
            answer.push(choice.dataset.set)
            $('#your-answer input').val(answer)
        })

        var timer = setInterval(()=>{
            time -= 1
            $('#time-left').text(time)
            if (time == 0) {
                totalTime += 10
                $('.choice').off('click')
                $('#answer-button').off('click')
                let resultDOM = $('#quiz-result')
                resultDOM.text("Time out!!!")
                resultDOM.show()
                setTimeout(()=> {
                    resultDOM.hide()
                    quizzes.splice(0, 1)
                    startQuiz(quizzes)
                }, 1500)
                clearInterval(timer)
            }
        },1000)

        
        $('#answer-button').click(()=>{
            $('#answer-button').off("click")
            totalTime += 10-time
            var result = false
            if (answer.length == currentQuiz.answer.length) {
                result = answer.every((val) => currentQuiz.answer.includes(val))
            }
            score += result ? 1 : 0
            let resultDOM = $('#quiz-result')
            resultDOM.text(result ? "Correct!!" : "Wrong!!")
            resultDOM.show()
            setTimeout(()=> {
                resultDOM.hide()
                quizzes.splice(0, 1)
                startQuiz(quizzes)
            }, 1500)
            clearInterval(timer)
        })
    
    }

    var shuffle = (array)=> {
        var j, x, i;
        for (i = array.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = array[i];
            array[i] = array[j];
            array[j] = x;
        }
    }

    changeMode(HOME);
    
})