PennController.ResetPrefix(null); // Shorten command names (keep this line here))

DebugOff()   // Debugger is closed

Header(
    // Declare global variables to store the participant's ID and demographic information
    newVar("ID").global(),
    newVar("GENERO").global(),
    newVar("NATIVO").global(),
    newVar("IDADE").global(),
    newVar("ESCOLARIDADE").global(),
    newVar("CERTIFICADO").global()
)

 // Add the particimant info to all trials' results lines
.log( "ID"     , getVar("ID") )
.log( "GENERO" , getVar("GENERO") )
.log( "NATIVO" , getVar("NATIVO") )
.log( "IDADE"    , getVar("IDADE") )
.log( "ESCOLARIDADE" , getVar("ESCOLARIDADE") )
.log( "CERTIFICADO"   , getVar("CERTIFICADO") )

// Sequence of events: consent to ethics statement required to start the experiment, participant information, instructions, exercise, transition screen, main experiment, result logging, and end screen.
Sequence("consentimento", "setcounter", "participants", "instructions", randomize("exercise"), "start_experiment", rshuffle("experiment-filler", "experiment-item"), SendResults(), "end")

// Ethics agreement: participants must agree before continuing
newTrial("consentimento",
    newHtml("ethics_explanation", "consentimento.html")
        .cssContainer({"margin":"1em"})
        .print()
    ,
    newHtml("form", `<div class='fancy'><input name='consent' id='consent' type='checkbox'><label for='consent'>Li e concordo em participar da pesquisa.</label></div>`)
        .cssContainer({"margin":"1em"})
        .print()
    ,
    newFunction( () => $("#consent").change( e=>{
        if (e.target.checked) getButton("go_to_info").enable()._runPromises();
        else getButton("go_to_info").disable()._runPromises();
    }) ).call()
    ,
    newButton("go_to_info", "Continuar")
        .cssContainer({"margin":"1em"})
        .disable()
        .print()
        .wait()
)

// Start the next list as soon as the participant agrees to the ethics statement
// This is different from PCIbex's normal behavior, which is to move to the next list once 
// the experiment is completed. In my experiment, multiple participants are likely to start 
// the experiment at the same time, leading to a disproportionate assignment of participants
// to lists.
SetCounter("setcounter")

// Participant information: questions appear as soon as information is input
newTrial("participants",
    defaultText
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .print()
    ,
    newText("participant_info_header", "<div class='fancy'><h2>Questionário sociodemográfico</h2><p>Por favor, complete esse questionário com algumas informações sobre você.</p></div>")
    ,
    // Participant ID
    newText("participantID", "<b>Informe seu nome ou, se preferir, suas iniciais.</b>")
    ,
    newTextInput("input_ID")
        .log()
        .print()
    ,
    // Genero
    newText("<b>Selecione o seu gênero</b>")
    ,
    newScale("input_genero",   "Feminino", "Masculino", "Outro", "Prefiro não responder")
        .radio()
        .log()
        .labelsPosition("right")
        .print()
    ,
    // Nativo
        newText("<b>O português brasileiro é sua língua materna (ou seja, a primeira língua que você aprendeu)?</b>")
    ,
    newScale("input_nativo",   "Sim", "Não")
        .radio()
        .log()
        .labelsPosition("right")
        .print()
    ,
    // Idade
    newText("<b>Qual a sua idade?</b><br>(responda usando números)")
    ,
    newTextInput("input_idade")
        .length(2)
        .log()
        .print()
    ,
    // Escolaridade
    newText("<b>Qual sua escolaridade?</b>")
    ,
    newScale("input_escolaridade",   "Primeiro Grau completo ou cursando", "Segundo grau completo ou cursando", "Curso universitário completo ou cursando")
        .radio()
        .log()
        .labelsPosition("right")
        .print()
    ,
        // Certificado
    newText("<b>Se quiser receber certificado de participação, deixe seu e-mail aqui:</b>")
    ,
    newTextInput("input_certificado")
        .log()
        .print()
    ,
    newText("<b>Obs.: O certificado de participação apenas será enviado caso você tenha deixado seu nome completo.</b>")
    .color("red")
    ,
    // Clear error messages if the participant changes the input
    newKey("just for callback", "") 
        .callback( getText("errorage").remove() , getText("errorID").remove() )
    ,
    // Formatting text for error messages
    defaultText.color("Crimson").print()
    ,
    // Continue. Only validate a click when ID and age information is input properly
    newButton("weiter", "Continuar para instruções")
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .print()
        // Check for participant ID and age input
        .wait(
             newFunction('dummy', ()=>true).test.is(true)
            // ID
            .and( getTextInput("input_ID").testNot.text("")
                .failure( newText('errorID', "Por gentileza, coloque seu nome ou iniciais.") )
            // Age
            ).and( getTextInput("input_idade").test.text(/^\d+$/)
                .failure( newText('errorage', "Por gentileza, coloque sua idade."), 
                          getTextInput("input_idade").text("")))  
        )
    ,
    // Store the texts from inputs into the Var elements
    getVar("ID")     .set( getTextInput("input_ID") ),
    getVar("GENERO") .set( getScale("input_genero") ),
    getVar("NATIVO")   .set( getScale("input_nativo") ),
    getVar("IDADE") .set( getTextInput("input_idade") ),
    getVar("ESCOLARIDADE")    .set( getScale("input_escolaridade") ),
    getVar("CERTIFICADO") .set( getTextInput("input_certificado") )
)

// Instructions
newTrial("instructions",
    newText("instructions_greeting", "<h2>INSTRUÇÕES</h2><p>Neste experimento, você deverá avaliar algumas frases do português de acordo com uma escala de 0 a 100, em que 0 significa TOTALMENTE ARTIFICIAL e 100 significa TOTALMENTE NATURAL.</p><p>Ao iniciar, você verá uma frase. Leia-a com atenção e atribua uma nota a ela movimentando a escala de 0 a 100.</p><p>Por fim, clique em PRÓXIMO para enviar sua nota e continuar avaliando as próximas frases.</p><p>Observe que não nos interessa saber se a frase é correta ou não, mas apenas se ela lhe parece natural ou artificial segundo o uso cotidiano que todos os falantes fazem da língua.</p><p>Após entender essas instruções, clique em INICIAR para começar.</p>")
        .left()
        .cssContainer({"margin":"1em"})
        .print()
        ,
  
    newButton("go_to_exercise", "Iniciar experimento")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
)

// Exercise
Template("exercise.csv", row =>
newTrial( "exercise" ,
        newText("sentence", row.SENTENCE)
            .cssContainer({"margin-top":"2em", "margin-bottom":"2em", "font-size":"1.5em"})
            .center()
            .print()
            ,
            
newScale("choice",  row.CHOICE1, row.CHOICE2)
        .radio()
        .log()
        .labelsPosition("right")
        .center()
        .print()
        
    ,
            newButton("go_to_exercise", "Próximo")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
,
        // Wait briefly to display which option was selected
        newTimer("wait", 300)
            .start()
            .wait()
))
 ,

// Start experiment
newTrial( "start_experiment" ,

// Experimental trial

Template("experiment.csv", row =>
    newTrial( "experiment-"+row.TYPE,
        newText("sentence", row.SENTENCE)
            .cssContainer({"margin-top":"2em", "margin-bottom":"2em", "font-size":"1.5em"})
            .center()
            .print()
            ,
            
    // 7-point scale

   newScale("choice",  row.CHOICE1, row.CHOICE2)
        .radio()
        .log()
        .labelsPosition("right")
        .center()
        .print()
        .log("last")
  ,
    newButton("go_to_exercise", "Próximo")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
        ,
        // Wait briefly to display which option was selected
        newTimer("wait", 300)
            .start()
            .wait()
    )
    
    // Record trial data
    .log("ITEM"     , row.ITEM)
    .log("SENTENCE" , row.SENTENCE)
    .log("CHOICE1" , row.CHOICE1)
    .log("CHOICE2" , row.CHOICE2)
))

// Final screen: explanation of the goal
newTrial("end",
    newText("<div class='fancy'><h2>Obrigado pela participação!</h2></div><p>Você pode fechar esta janela agora.")
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .print()
    ,
    // Trick: stay on this trial forever (until tab is closed)
    newButton().wait()
)
.setOption("countsForProgressBar",false);