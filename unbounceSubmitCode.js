
<script type="text/javascript">
// https://community.unbounce.com/t/how-to-run-custom-code-scripts-on-form-submission/5079
//
// Key things to set up in this script:
// 1. Make sure the name of the form is correct when setting "sform"
// 2. Make sure the name of the button is correct when setting submit button 
//
function yourSubmitFunction(e, $) {
  e.preventDefault();
  try {
    // collapse fields into var
    var sform =  $("#lp-pom-form-80").find("form"); // make sure to check this in new pages
    var vals = sform.serializeArray().reduce(function (obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});
      // if new submission, check to see if vmware
      if (!vals.invitecode) {
        var mailformat = /^\w+([\.-]?\w+)*@vmware.com$/;
        if (vals.email.match(mailformat) || vals.company.match(/vmware/i)) {
          alert("The Wavefront self-service trial is for customers only." +
                '\n' + '\n' +
                "If you would like access the internal instance of Wavefront, please" +
                '\n' +
                "follow the instructions found on the internal wiki page:" +
                '\n' + '\n' +
                "https://confluence.eng.vmware.com/display/TME/Wavefront+Quickstart" +
                '\n' + '\n' +
                "Contact metrics@vmware.com if you have questions.");
          return false;
        } //close if VMware
      } // invite code.
        // build the submission
        var formData = {
          "action": "bring_your_validated_data_unbounce",
          "first_name": vals.firstname,
          "last_name": vals.lastname,
          "company_name": vals.company,
          "country_name": vals.country,
          "email": vals.email
        };

        var submitBtn = $('#lp-pom-button-81'); // make sure this is correct
        var origText = submitBtn.text();
        submitBtn.text("PLEASE WAIT");
        submitBtn.attr({ "disabled": true });

        $.ajax({
          url: "https://www.wavefront.com/wp-admin/admin-ajax.php", 
          type: "POST",
          crossDomain : true,
          headers: {"Host" : "www.wavefront.com", 
                    "Origin" : "https://go.wavefront.com"},
          data : formData,
          success: function (response) {
          	  response1 = JSON.parse(response);
         	  body = JSON.parse(response1.data.body);
        	  submitBtn.text(origText);
        	  submitBtn.attr({ "disabled": false });

        	  if (body.status && body.status.result === 'ERROR') {
        	    alert(body.status.message);
        	    return false;
			  }
          	  if (!body.response || !body.response.inviteCode) {
            	alert('An unexpected error occurred during the form submission =(');
            	return false;
          	  }
              // 
              $('#invitecode').val(body.response.inviteCode);
              gaForm(e);
          } // end of success function
        }); // end of $ajax call 
  } // end try block
  catch(err) {
    //code to handle errors. console.log is just an example
    console.log(err);
    ga('send', 'event', 'Unbounce', 'fail-catch-error', 'self-service-trial-fail');
    return false;
  } 
  finally {
// This submits the form. If your code is asynchronous, add to callback instead
    // not sure I need this.
  }
} // end of yourSubmitFunction

lp.jQuery(function($) {
  $('.lp-pom-form .lp-pom-button').unbind('click tap touchstart').bind('click.formSubmit', function(e) {
    if ( $('.lp-pom-form form').valid() ) yourSubmitFunction(e, $);
  });
  $('form').unbind('keypress').bind('keypress.formSubmit', function(e) {
    if(e.which === 13 && e.target.nodeName.toLowerCase() !== 'textarea' && $('.lp-pom-form form').valid() )
      yourSubmitFunction(e, $);
  });
});
//ga form submission event
function gaForm(event) {
  var $form, $formContainer, params;
  event.preventDefault();
  event.stopPropagation();
  $formContainer = lp.jQuery(event.currentTarget).closest('.lp-pom-form');
  $form = $formContainer.children('form');
  if ($form.valid()) {
    return $form.submit();
    }
  }

</script>
