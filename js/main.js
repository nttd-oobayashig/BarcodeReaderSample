$(function () {

    // リロードボタンを押したときのアクション
    $('#reload').click(function(){
        let msg = "フレームレート：" + $('#framerate').val() + "  認識回数閾値："+$('#DetectedCount').val();
        $('#setting').val(msg);
        startScanner();
    });

    $('#reload').click();
});

var DetectedCount = 0, DetectedCode = "";

var startScanner = () => {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#photo-area'),
            constraints: {
                facingMode: "environment"
            },
            area: { top: "20%", right: "0%", left: "0%", bottom: "20%" },
            singleChannel: false
        },
        frequency: parseInt($('#framerate').val()),
        decoder: {
            readers: ["code_39_reader"],
            multiple: false,
            debug: {
                drawBoundingBox: false,
                showFrequency: false,
                drawScanline: false,
                showPattern: false
            }
        },

    }, function (err) {
        if (err) {
            console.log(err);
            return
        }

        console.log("Initialization finished. Ready to start");
        Quagga.start();
        document.getElementById("photo-area").style.display = "inline";
        $('#reslut').val("");

        let canvas = document.getElementById("frame");
        canvas.width = Quagga.canvas.dom.overlay.width;
        canvas.height = Quagga.canvas.dom.overlay.height;
        let ctx = canvas.getContext("2d");
        const x = 0;
        const y = Quagga.canvas.dom.overlay.height * 0.2;
        const mw = Quagga.canvas.dom.overlay.width;
        const mh = Quagga.canvas.dom.overlay.height * 0.6;

        ctx.strokeStyle = "rgb(255,0,0)";
        ctx.lineWidth = 3;
        ctx.rect(x,y,mw,mh);
        ctx.stroke();

        // Set flag to is running
        _scannerIsRunning = true;
    });

    Quagga.onProcessed(function (result) {
        let drawingCtx = Quagga.canvas.ctx.overlay;
        let drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            // 検出中の緑の線の枠
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {
                        x: 0,
                        y: 1
                    }, drawingCtx, {
                        color: "green",
                        lineWidth: 2
                    });
                });
            }

            // 検出完了時の赤線
            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {
                    x: 'x',
                    y: 'y'
                }, drawingCtx, {
                    color: 'red',
                    lineWidth: 3
                });
            }
        }
    });

    //barcode read call back
    Quagga.onDetected(function (result) {
        console.log(result.codeResult.code);
        if (DetectedCode == result.codeResult.code) {
            DetectedCount++;
        } else {
            DetectedCount = 0;
            DetectedCode = result.codeResult.code;
        }
        if (DetectedCount >= parseInt($('#DetectedCount').val())) {
            console.log(result.codeResult.code);
            DetectedCode = '';
            DetectedCount = 0;
            $('#result').val(result.codeResult.code);
            document.getElementById("photo-area").style.display = "none";
            Quagga.stop()
        }
    });
}