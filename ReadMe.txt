dependencies:
fabric.js --> canvas
jQuery
materialize
fontawesome

Once user press the confirm button after finish drawing, it will excecute
"toGAN()" function which will result json output with following format:

{
	"color1": {"id1":sketch_1},
	"color2": {"id2":sketch_2},
	"color3": {"id3":sketch_3},
	"color4": {"id4":sketch_4}
}

the input to put back to the canvas:

{
	"color1": {"id1":GAN_1},
	"color2": {"id2":GAN_2},
	"color3": {"id3":GAN_3},
	"color4": {"id4":GAN_4}
}

# Haven't finished the purchase UI