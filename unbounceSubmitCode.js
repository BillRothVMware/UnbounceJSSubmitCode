
<script type="text/javascript">
// Sep 28 2018 mods by bill roth
//
// https://community.unbounce.com/t/how-to-run-custom-code-scripts-on-form-submission/5079
//
// Key things to set up in this script:
// 1. Make sure the name of the form is correct when setting "sform"
// 2. Make sure the name of the button is correct when setting submit button 
//
function yourSubmitFunction(e, $) {
  e.preventDefault();
  try {
    console.log("inside try");
    // collapse fields into var
    var sform =  $("#lp-pom-form-80").find("form");
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

        var submitBtn = $('#lp-pom-button-81');
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
          success: function (response, textStatus, jqXHR ) {
              if(response === null) {
                console.log("Null response");
                throw "Null response from service";
                return false;
              }
              console.log(response);
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
            
              // (document.form[0]).off('submit');
              $('#invitecode').val(body.response.inviteCode);
              gaForm(e);
              lp.jQuery('.lp-pom-form form').submit();
            
          }, // end of success function
          error: function (response,errortext,errorthrown) {
                 console.log(response);
                 console.log(errortext);
                 console.log(errorthrown);
          }
        }); // end of $ajax call 
  } // end try block
  catch(err) {
    //code to handle errors. console.log is just an example
    console.log(err);
    return false;
  } 
  finally {
// This submits the form. If your code is asynchronous, add to callback instead
    // not sure I need this.
  }
  return false;
} // end of yourSubmitFunction

//ga form submission event
function gaForm(event) {
  var $form, $formContainer, params;
  event.preventDefault();
  event.stopPropagation();
  $formContainer = lp.jQuery(event.currentTarget).closest('.lp-pom-form');
  $form = $formContainer.children('form');
  if ($form.valid()) {
    console.log("calling form.submit");
    return $form.submit();
    } else {
      console.log("Form not valid");
    } 
}

lp.jQuery(window).load(function(){
 lp.jQuery(function($) {
   $('.lp-pom-form .lp-pom-button').unbind('click tap touchstart').bind('click.formSubmit tap.formSubmit touchstart.formSubmit', function(e) {
     if ( $('.lp-pom-form form').valid() ) yourSubmitFunction(e, $);
   });
   $('form').unbind('keypress').bind('keypress.formSubmit', function(e) {
     if(e.which === 13 && e.target.nodeName.toLowerCase() !== 'textarea' && $('.lp-pom-form form').valid() )
       yourSubmitFunction(e, $);
   });
 });
});
</script>
