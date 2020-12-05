var payButton = document.getElementById("pay-button");
var form = document.getElementById("payment-form");
var errorStack = [];
Frames.init({
    publicKey: "pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a",
    style: {
        focus: {
          color: "red"
        },
        valid: {
          color: "green"
        },
        invalid: {
            color: '#dc3545'
        },
        placeholder: {
          base: {
            color: "red"
          }
        }
      }
});

Frames.addEventHandler(
  Frames.Events.CARD_VALIDATION_CHANGED,
  onCardValidationChanged
);
function onCardValidationChanged(event) {
  console.log("CARD_VALIDATION_CHANGED: %o", event);
  payButton.disabled = !Frames.isCardValid();
}

Frames.addEventHandler(
  Frames.Events.FRAME_VALIDATION_CHANGED,
  onValidationChanged
);
function onValidationChanged(event) {
  console.log("FRAME_VALIDATION_CHANGED: %o", event);

  var errorMessageElement = document.querySelector(".error-message");
  var hasError = !event.isValid && !event.isEmpty;

  if (hasError) {
    errorStack.push(event.element);
  } else {
    errorStack = errorStack.filter(function(element) {
      return element !== event.element;
    });
  }

  var errorMessage = errorStack.length
    ? getErrorMessage(errorStack[errorStack.length - 1])
    : "";
  errorMessageElement.textContent = errorMessage;
};

function getErrorMessage(element) {
  var errors = {
    "card-number": "Please enter a valid card number",
    "expiry-date": "Please enter a valid expiry date",
    cvv: "Please enter a valid cvv code"
  };

  return errors[element];
};

Frames.addEventHandler(
  Frames.Events.CARD_TOKENIZATION_FAILED,
  onCardTokenizationFailed
);
function onCardTokenizationFailed(error) {
  console.log("CARD_TOKENIZATION_FAILED: %o", error);
  Frames.enableSubmitForm();
};

Frames.addEventHandler(Frames.Events.CARD_TOKENIZED, onCardTokenized);
function onCardTokenized(event) {
  threeDS(event.token); // execute 3DS API
  var el = document.querySelector(".success-payment-message");
  el.innerHTML =
    "Card tokenization completed<br>" +
    'Your card token is: <span class="token">' +
    event.token +
    "</span>";
};
var payButton = document.getElementById("pay-button");
payButton.addEventListener("click", function(event) {
  event.preventDefault();
  Frames.submitCard();
});

function threeDS(token) {
    var settings = {
      "url": "https://integrations-cko.herokuapp.com/pay3d",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json"
      },
      "data": JSON.stringify({"token":token,"success_url":window.location.origin+"/success.html","failure_url":window.location.origin+"/failed.html"}),
    };

    $.ajax(settings).done(function (response) {
      console.log(response);
      redirect(response.redirection_url);
      setSpin(false, 'pay-button');
    });
  };

function redirect(source){
    $('#modal').modal('show');
    $('#iframe').attr('src', source);
};

function setSpin (boolval,element){
    if(boolval){
        document.querySelector('#'+element+ '> span').className = 'spinner-border spinner-border-sm';
    }else
    {
        document.querySelector('#' +element+ '> span').className = '';
    }
};