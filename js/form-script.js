var PopUpMessages = function () {

    this.messageHtml = function (level, message) {
        var alert = '';

        if (message !== '') {
            alert = '<div class="alert alert-' + level + ' fade in"><a href="#" class="close" data-dismiss="alert">&times;</a><span>' + message + '</span></div>';
        }

        return alert;
    };

    this.message = function (level, message, containerId, timeOut) {
        timeOut     = timeOut || 0;
        containerId = containerId || '#pop-up-message-container';

        $(containerId).empty().html(this.messageHtml(level, message));

        if (timeOut !== 0) {
            setTimeout(function () {
                $(containerId).empty();
            }, timeOut);
        }
    };

    this.success = function (message, containerId, timeOut) {
        this.message('success', message, containerId, timeOut);
    };

    this.info = function (message, containerId, timeOut) {
        this.message('info', message, containerId, timeOut);
    };

    this.warning = function (message, containerId, timeOut) {
        this.message('warning', message, containerId, timeOut);
    };

    this.danger = function (message, containerId, timeOut) {
        this.message('danger', message, containerId, timeOut);
    };
};

(function($) {
    $('#phone').inputmask({
        'mask':'+7(999)999-99-99',
    });

    var formValidator = new FormValidator();

    formValidator.setErrorMessages({
        'name': 'Необходимо ввести Имя',
        'e-mail': 'Необходимо ввести E-Mail',
        'phone': 'Необходимо ввести Телефон',
        'message': 'Необходимо ввести Сообщение',
    });

    var $mainForm = $('#main__form');
    var popUpMessage = new PopUpMessages();
    formValidator.setSendFormCallback(function (response) {
        if (response.errors) {
            formValidator.fillErrors(response.errors);
            return false;
        } else {
            popUpMessage.info('Запрос успешно отправлен', '#pop-up-message-container', 5000);
            $mainForm[0].reset();
        }
    });

    formValidator.init('main__form');
})(jQuery);