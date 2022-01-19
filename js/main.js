
const pluss_painel_left_top      = document.querySelector(".pluss_painel_left_top")
const pluss_painel_left_botton   = document.querySelector(".pluss_painel_left_bottom")
const pluss_painel_middle_botton = document.querySelector(".pluss_painel_middle_bottom")
const pluss_painel_right_top     = document.querySelector(".pluss_painel_right_top")
const pluss_painel_right_botton  = document.querySelector(".pluss_painel_right_botton")

const intern_square              = document.querySelector(".intern_square")

const title_info                 = document.querySelector(".Title_Info")

var audio                        = document.getElementById('audio');

var selected_music = 0
var volume         = 1
var auto_play      = false
const Painels = [
    pluss_painel_left_top,
    pluss_painel_left_botton,
    pluss_painel_middle_botton,
    pluss_painel_right_top,
    pluss_painel_right_botton
];

var fps = 60;

/*Animation controller*/
(()=>{

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    async function random_pluss_rotate() {
        let selected_painel = getRandomInt(0,Painels.length-1)
        let pluss_list      = Painels[selected_painel].querySelectorAll(".pluss")
        let selected_pluss  = getRandomInt(0,pluss_list.length-1)
        pluss_list[selected_pluss].classList.toggle("pluss_rotate")
    }

    function Loop() {
        setTimeout(()=>{
            random_pluss_rotate()
            Loop()
        },1000)
    }

//Iniciando uma Thread
    setTimeout(()=>{
        Loop()
    },1)
})();

/*Audio controller*/
(()=>{
    var intern_octagon_rotate_deg = 0;
    var played = false
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

    var start = function() {

        var ctx = new AudioContext();
        var analyser = ctx.createAnalyser();
        var audioSrc = ctx.createMediaElementSource(audio);

        audioSrc.connect(analyser);
        analyser.connect(ctx.destination);

        //var frequencyData = new Uint8Array(analyser.frequencyBinCount);

        var canvas = document.getElementById('canvas'),
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            meterWidth = 3, //width of the meters in the spectrum
            gap = 5, //gap between meters
            capHeight = 1,
            capStyle = '#fff',
            meterNum = 800 / 22, //count of the meters
            capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
        ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(1, '#fff');
        gradient.addColorStop(0.5, '#fff');
        gradient.addColorStop(0, '#fff');

        function animate() {
            if(!played)
                return
            let array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);

            let step = Math.round(array.length / meterNum); //sample limited data from the total array
            ctx.clearRect(0, 0, cwidth, cheight);
            let size = 0
            let media = 0

            for (let i = 0; i < meterNum; i++) {
                let value = array[i * step];
                media+=value
                if (capYPositionArray.length < Math.round(meterNum)) {
                    capYPositionArray.push(value);
                };
                ctx.fillStyle = capStyle;

                //draw the cap, with transition effect
                if (value < capYPositionArray[i]) {
                    ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                } else {
                    ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
                    capYPositionArray[i] = value;
                };
                ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
                ctx.fillRect(i * 12 , cheight - value + capHeight, meterWidth, cheight); //the meter

                if(i > meterNum/2)
                    size += value*i
                else
                    size += (value/2)
            }

            media = media/meterNum
            size += media

            intern_octagon_rotate_deg += (size/(meterNum*200))
            if(intern_octagon_rotate_deg >= 360) {
                intern_octagon_rotate_deg = 0
            }
            intern_square.style.transform = 'rotate('+intern_octagon_rotate_deg+'deg)'

            setTimeout(() => {
                requestAnimationFrame(animate);
            }, 1000 / fps);
        
        }
        animate();
    };

    document.querySelector(".container").addEventListener("click",()=>{
        if (played) {
            audio.pause()
            played = false
        } else {
            audio.play()
            played = true
        }

    })

    audio.src = musics[selected_music].music_src
    document.querySelector("#player").src = "https://www.youtube.com/embed/"+musics[selected_music].yt_id+"?enablejsapi=1"
    audio.volume = 0.1
    audio.onplay = function(){
        played = true
        start();
    };
    audio.onpause = function () {
        played = false
    };
})();
/*Random Blur scene octagon controller*/
(()=>{

    const scene_octagon = document.querySelector(".scene_octagon")
    var applied_Blur = 0
    var max_blur     = 5
    var step_blur    = 0.3
    var update_delay = 50

    function removeBlur() {
        applied_Blur-= step_blur
        scene_octagon.style.filter = 'blur('+applied_Blur+'px)'
        if(applied_Blur > 0)
            setTimeout(()=>{
                removeBlur()
            },update_delay)

    }

    function incrementBlur() {
        applied_Blur+= step_blur
        scene_octagon.style.filter = 'blur('+applied_Blur+'px)'

        if(applied_Blur < max_blur)
            setTimeout(()=>{
                incrementBlur()
            },update_delay)
        else
            setTimeout(() => {
                removeBlur()
            }, update_delay)

    }

    function randomBlurLoop () {
        setTimeout(()=>{
            if(applied_Blur <= 0) {
                incrementBlur()
            }
            randomBlurLoop()
        },10000)
    }

    setTimeout(()=>{
        randomBlurLoop()
    },1)
})();

/*Music Selector*/
(()=>{

    document.addEventListener("keyup",(event)=>{

        if(event.key == "ArrowLeft") {
            if(selected_music-1 < 0) {
                selected_music = musics.length-1
            }else
                selected_music-=1
        } else if(event.key == "ArrowRight") {
            if(selected_music+1 > musics.length-1) {
                selected_music = 0
            }else
                selected_music+=1
        }
        audio.src = musics[selected_music].music_src
        update()
    })

    function update() {
        title_info.querySelector("h1").innerText =  musics[selected_music].title
        title_info.querySelector("h1").style.fontSize = musics[selected_music].font_size
        document.querySelector(".music_title").textContent = musics[selected_music].music_title
        document.querySelector("#player").src = "https://www.youtube.com/embed/"+musics[selected_music].yt_id+"?enablejsapi=1"
		//document.querySelector("#player").contentDocument.location.reload(true)
	}


    const auto_play_input = document.querySelector(".auto_play_input")

    let auto_function = ()=>{
        if(selected_music+1 > musics.length-1){
            selected_music = 0;
        } else
            selected_music += 1;
        audio.src = musics[selected_music].music_src
        update()
        audio.play()
    }

    if(auto_play_input.checked) {
        audio.addEventListener("ended", auto_function)
    }

    auto_play_input.addEventListener("change",()=>{
        if(auto_play_input.checked) {
            audio.addEventListener("ended",auto_function)
        }else{
            audio.removeEventListener("ended",auto_function);
        }
    })
})();

//config painel
(()=>{

    const config_btn_img = document.querySelector(".config_btn_img")
    const fps_input = document.querySelector(".fps_input")
    const volume_input = document.querySelector(".volume_input")
    const yt_view_input = document.querySelector(".yt_view_input")

    volume_input.value = audio.volume



    config_btn_img.addEventListener("click",()=>{
        let painel = document.querySelector(".config_painel_view")
        painel.classList.toggle("hidden")
        painel.classList.toggle("expand_bottom")
    })

    const audio_speed_input = document.querySelector(".audio_speed_input")
    audio_speed_input.value = 100

    fps_input.addEventListener("change", (event)=>{
        fps = parseInt(event.target.value)
    })

    volume_input.addEventListener("change", (event)=>{
        audio.volume = parseInt(event.target.value)*0.01
    })

    audio_speed_input.addEventListener("change", (event)=>{
        audio.playbackRate = parseInt(event.target.value)*0.01
    })

    yt_view_input.addEventListener("change",()=>{
        document.querySelector(".yt_video").classList.toggle("hidden")
    })

})();

