$(document).ready(function () {

    const _operation_equal = "=";
    const _operation_clear = "C";
    const _expressionRegex = /[0-9]+\.?([0-9]+)?[+\-*\/][0-9]+\.?([0-9]+)?/;
    const _operatorArray = ["+","-","/","*"]
    let _display = $("#calc_display");
    let _displayingResult = false;
    let _expression = "";
    refreshHistory();

    $('.calc_element').click(function () {

        let operation = $(this).attr("operation");

        //Check if user can continue with result
        if (!_operatorArray.includes(operation.trim()) && _displayingResult) {
            _expression = "";
            _displayingResult = false;
        }
        else {
            _displayingResult = false
        }

        //Check if expression should be evaluated
        if (operation === _operation_equal) {

            compute_expression(_expression)
            return;
        }

        //Check if display shold be cleared
        if (operation === _operation_clear) {
            _expression = "";
            _display.val("");
            return;
        }

        //add character and display expression
        _expression = _expression + operation;
        _display.val(_expression);

    })

    //Computes the expression (used math.js from https://mathjs.org/)
    function compute_expression(expression) {

        let outcome = 0;

        if (validateExpression(expression)) {

            try {
                _displayingResult = true;
                outcome = math.evaluate(expression)
                _display.val(outcome);
                sendExpression(_expression + "=" + outcome);
                _expression = outcome;
                refreshHistory();
            }
            catch (error)
            {
                showError();
            }
            
        }
        else
        {
            showError();
        }
    }

    //Validates input agains regex
    function validateExpression(expression) {

        if (_expressionRegex.test(expression)) {
            return true;
        }
        else {
            return false;
        }
    }

    //Sends whole input to backend to be saved in DB
    function sendExpression(expression)
    {
        $.ajax({

            method: "POST",
            async: false,
            url: "api/v1/math/saveExpression",
            data: {
                expression: expression
            },
            success: function (output) {

                console.log(output);
            }, error: function (error) {

                console.log(error);
            }
        });
    }

    //AJAX call to get latest ten expressions
    function refreshHistory()
    {
        let div = $("#history_content");
        $.ajax({

            method: "GET",
            async: false,
            url: "api/v1/math/getLatestExpressions",
            success: function (response)
            {
                let appendString = "";
                response.forEach(function (element) {
                    appendString += "<div class=\"row\"> <p>" + element.expression + "</p></div>";
                })        
                div.html(appendString);
            }
        })
        
    }

    //Displays error
    function showError()
    {
        _display.val("_ERR")
        _expression = "";
    }
});