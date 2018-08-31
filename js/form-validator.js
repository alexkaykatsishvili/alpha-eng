FormValidator = function () {
    var self = this;

    this.form_id                = 'edit_form';
    this.form                   = $('#' + this.form_id);
    this.error_messages         = [];
    this.elements_validators    = {};
    this.only_validate           = false;

    this.init = function (form_id) {
        if (form_id !== undefined) {
            self.setFormID(form_id);
            self.form = $('#' + form_id);
        }

        var form = self.form,
            send_button = $('[type=submit]', form);

        self.input_elements = $('input, select, textarea', self.form);

        self.input_elements.on('change blur', function () {
            self.setCurrentElement($(this));
            self.validateCurrentElement();
        });

        self.input_elements.on('click focus', function () {
            self.setCurrentElement($(this));
            self.deleteErrorMessage();
        });

        send_button.off('click');
        send_button.click(function (event) {
            if (self.validate()) {
                if (self.getOnlyValidate()) {
                    form.submit();
                } else {
                    event.preventDefault();
                    self.sendFormHandler();
                }
            } else {
                event.preventDefault();
            }
        });
    };

    this.sendFormHandler = function () {
        if (self.form.attr('enctype') === 'multipart/form-data') {
            $.ajaxSetup({
                contentType     : false,
                processData     : false,
                data            : new FormData(self.form.get(0))
            });
        } else {
            $.ajaxSetup({
                contentType     : 'application/x-www-form-urlencoded',
                processData     : true,
                data            : self.form.serialize()
            });
        }

        $.ajax({
            type        : self.form.attr('method') || 'POST',
            url         : self.form.attr('action') || '',

            dataType    : 'json',
            success: function (response) {
                self.getSendFormCallback()(response, self);
            },
            error: function (response) {
                self.getSendFormErrorCallback()(response, self);
            }
        });

        $.ajaxSetup({
            contentType     : 'application/x-www-form-urlencoded',
            processData     : true,
            data            : null
        });
    };

    this.validate = function () {
        var first_bad_element = false,
            current_element,
            errors_count = 0;

        self.input_elements = $('input, select, textarea', self.form);

        self.input_elements.each(function () {
            current_element = $(this);
            self.setCurrentElement(current_element);
            if (self.validateCurrentElement() > 0) {
                if (!first_bad_element) {
                    first_bad_element = current_element;
                    errors_count++;
                }
            }
        });

        if (errors_count > 0) {
            var bad_element_position = $(first_bad_element).offset().top - 120;
            $(document).scrollTop(bad_element_position);
            return false;
        } else {
            return true;
        }
    };

    this.validateCurrentElement = function () {
        var error_count = 0,
            current_element = self.getCurrentElement(),
            current_value = current_element.val().trim(),
            current_name = current_element.attr('name'),
            current_element_type = current_element.attr('type');

        if (!(current_element.prop('disabled') || current_element_type === 'hidden')) {
            if (current_element.prop('required')) {
                if (current_element_type === 'checkbox') {
                    if (!current_element.prop('checked')) {
                        self.insertErrorMessage();
                        error_count++;
                    }
                } else {
                    if (current_value === '' || current_value === null) {
                        self.insertErrorMessage();
                        error_count++;
                    }
                }
            }

            if (current_element.attr('type') === 'email' && current_value !== '') {
                if (!self.checkEmail(current_value)) {
                    self.insertErrorMessage('Введен некорректный адрес электронной почты');
                    error_count++;
                }
            }

            if (typeof self.elements_validators[current_name] === 'function') {
                var validation = self.elements_validators[current_name](current_value);
                if (!validation.result) {
                    self.insertErrorMessage(validation.message || null);
                    error_count++;
                }
            }

        }

        return error_count;
    };

    this.insertErrorMessage = function (message) {
        var error_messages      = self.getErrorMessages(),
            current_element     = self.getCurrentElement(),
            input_element_name  = current_element.attr('name');

        message = message || error_messages[input_element_name];

        current_element.addClass('has-error');
        if (current_element.next('p.error').length < 1 && message) {
            current_element.after(renderErrorMessage(message));
        }

        function renderErrorMessage (message) {
            var msg = '';
            if (typeof message === 'string') {
                msg+= '<span>' + message + '</span>';
            } else {
                msg+= '<span>';
                $.each(message, function (key, message) {
                    msg+= message + '</br>';
                });
                msg+= '</span>';
            }
            return '<p class="error">'+msg+'</p>';
        }
    };

    this.deleteErrorMessage = function () {
        var current_element = self.getCurrentElement();

        current_element.removeClass('has-error');
        current_element.next('p.error').remove();
    };

    this.deleteAllErrorMessages = function () {
        if( self.input_elements !== undefined ) {
            self.input_elements.each(function () {
                self.setCurrentElement($(this));
                self.deleteErrorMessage();
            });
        }
    };

    this.fillErrors = function (errors, arrayName) {
        if (errors) {
            arrayName = arrayName || '';

            $.each(errors, function (fieldName, error) {
                if (arrayName !== '') {
                    fieldName = arrayName + '[' + fieldName + ']';
                }

                self.setCurrentElement($('[name="' + fieldName + '"]'));
                self.insertErrorMessage(error)
            });

            $(document).scrollTop($('.has-error').first().offset().top - 120);
        }
    };


    this.getFormID = function () {
        return self.form_id;
    };

    this.getFormID = function () {
        return self.form_id;
    };

    this.setFormID = function (form_id) {
        self.form_id = form_id;
    };

    this.setErrorMessage = function (element_name, error_message) {
        self.error_messages[element_name] = error_message;
    };

    this.setErrorMessages = function (error_messages) {
        self.error_messages = error_messages;
    };

    this.getErrorMessages = function () {
        return self.error_messages;
    };

    this.setElementsValidators = function (elements_validators) {
        self.elements_validators = elements_validators;
    };

    this.getElementsValidators = function () {
        return self.elements_validators;
    };

    this.setElementValidator = function (element_name, validator) {
        if (typeof validator === 'function') {
            return self.elements_validators[element_name] = validator;
        }
    };

    this.getElementValidator = function (element_name) {
        return self.elements_validators[element_name];
    };

    this.setSendFormCallback = function (send_form_callback) {
        if (typeof send_form_callback === 'function') {
            self.send_form_callback = send_form_callback;
        }
    };

    this.getSendFormCallback = function () {
        return self.send_form_callback || function(){};
    };

    this.setSendFormErrorCallback = function (send_form__error_callback) {
        if (typeof send_form__error_callback === 'function') {
            self.send_form__error_callback = send_form__error_callback;
        }
    };

    this.getSendFormErrorCallback = function () {
        return self.send_form__error_callback || function(){};
    };

    this.setCurrentElement = function (current_element) {
        self.current_element = current_element;
    };

    this.getCurrentElement = function () {
        return self.current_element;
    };

    this.checkEmail = function (email) {
        var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    };

    this.onlyValidate = function (onlyValidate) {
        this.only_validate = onlyValidate;
    }

    this.getOnlyValidate = function () {
        return this.only_validate;
    }

};