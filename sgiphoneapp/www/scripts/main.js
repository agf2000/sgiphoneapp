// Para uma introdução ao modelo em branco, consulte a seguinte documentação:
// http://go.microsoft.com/fwlink/?LinkID=397704
// Para depurar códigos no carregamento de página em dispositivos/emuladores Android ou que simulam o Cordova: inicie o aplicativo, defina os pontos de interrupção 
// e execute "window.location.reload()" no Console do JavaScript.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    let lastId = 0

    function onDeviceReady() {
        // Manipular eventos de pausa e retomada do Cordova
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: o Cordova foi carregado. Execute qualquer inicialização que exija o Cordova aqui.
        //var parentElement = document.getElementById('deviceready');
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');
        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        $('.back').on('click', function () {
            var previous = '#' + $.mobile.activePage.prev('div[data-role="page"]')[0].id;
            $.mobile.changePage(previous, {
                transition: 'slide',
                reverse: true
            });
        });

        setTimeout(hideSplash, 1000);

        let db = window.sqlitePlugin.openDatabase({ name: 'sgi.db', location: 'default' });

        db.sqlBatch([
            "create table if not exists sgiConfig (id integer primary key, name text, value text);",
            "create table if not exists sgiproducts (id integer primary key, name text, price numeric(18,4), stock numeric(18,4));"],
            function () {
                console.log('Tables localed or created OK');
            },
            function (error) {
                alert('Transaction ERROR: ' + error.message);
            });

        $('body').on('pageshow', '#products', function () {

            db.transaction(function (tx) {
                tx.executeSql("select count(*) as productCount from sgiProducts", [], function (tx, rs) {
                    $('#btnSync').text('Sincronizar Produtos (' + rs.rows.item(0).productCount + ')');
                }, function (tx, error) {
                    alert('SELECT error: ' + error.message);
                });
            });

            let vm = new viewModel();

            db.transaction(function (tx) {
                tx.executeSql("select value as config from sgiConfig where name = 'useLocalDb'", [], function (tx, rs) {
                    $('#localDbChkbox').prop('checked', JSON.parse(rs.rows.item(0).config)).checkboxradio('refresh');;
                }, function (tx, error) {
                    alert('SELECT error: ' + error.message);
                });
            });

            let counter = 1;

            // Each time the user scrolls
            $(document).on("scrollstart", function (e) {
                // End of the document reached?
                //if ($(document).height() - win.height() === (win.scrollTop() + 30)) {
                var checked = $('#localDbChkbox').prop('checked');

                if (($(window).scrollTop() + $(window).height() > ($(document).height() / 2))) {

                    if (checked) {
                        db.transaction(function (tx) {
                            tx.executeSql("select * from sgiProducts where id > " + lastId + "  order by id limit 100", [], function (tx, rs) {
                                for (var i = 0; i < rs.rows.length; i++) {
                                    vm.products.push(new product({
                                        codigo: rs.rows.item(i).id,
                                        nome: rs.rows.item(i).name,
                                        preco: rs.rows.item(i).price,
                                        estoque: rs.rows.item(i).stock
                                    }));
                                    lastId++;
                                }
                                //$('#btnSync').text('Sincronizar Produtos (' + rs.rows.item(0).productCount + ')');
                            },
                                function (tx, error) {
                                    alert('SELECT error: ' + error.message);
                                });
                        },
                            function (error) {
                                alert('transaction error: ' + error.message);
                            },
                            function () {
                                console.log('transaction ok');
                            });
                    } else {

                        let strSearch = '';
                        if ($('#srch-term').val().length) {
                            strSearch = "+and+" + $('select option:selected').val() + "+like+'%" + $('#srch-term').val() + "'";
                        }
                        let uri = "http://192.168.25.172:8080/api/getProducts?orderBy=codigo&orderDir=desc&pageIndex=" + (counter + 1) + "&pageSize=30&searchFor=" + strSearch

                        $.ajax({
                            url: uri,
                            beforeSend: function (request) {
                                // $('#loading').show();
                                request.setRequestHeader("Authorization", "Negotiate");
                            },
                            async: true,
                            success: function (data) {
                                if (data && data.recordstotal) {
                                    $.each(data.data, (i, item) => {
                                        vm.products.push(new product(item));
                                    });
                                    counter++;
                                    // $('#loading').hide();
                                }
                            },
                            error: function (xhr, textStatus, errorMessage) {
                                $('#loading').hide();
                                alert(textStatus);
                            }
                        });
                    }
                }
            });

            $('#btnGetProducts').click((e) => {
                e.preventDefault();

                $("#popupBasic p").html("Carregando...");
                $("#popupBasic").popup('open');

                let strSearch = '',
                    strSearchFor = '';

                if ($('select option:selected').val()) {
                    strSearchFor = $('select option:selected').val();
                } else {
                    strSearchFor = 'p.nome';
                }

                if ($('#srch-term').val().length) {
                    strSearch = "+and+" + strSearchFor + "+=+'" + $('#srch-term').val() + "'";
                }

                var checked = $('#localDbChkbox').prop('checked');
                if (checked) {
                    db.transaction(function (tx) {
                        tx.executeSql("select * from sgiProducts where id > " + lastId + "  order by id limit 100", [], function (tx, rs) {
                            for (var i = 0; i < rs.rows.length; i++) {
                                //alert(rs.rows.item(i).price);
                                vm.products.push(new product({
                                    codigo: rs.rows.item(i).id,
                                    nome: rs.rows.item(i).name,
                                    preco: rs.rows.item(i).price,
                                    estoque: rs.rows.item(i).stock
                                }));
                                lastId++;
                            }
                        },
                            function (tx, error) {
                                alert('SELECT error: ' + error.message);
                            });
                    },
                        function (error) {
                            alert('transaction error: ' + error.message);
                        },
                        function () {
                            console.log('transaction ok');
                        });

                    $("#popupBasic").popup('close');
                } else {

                    let uri = "http://192.168.25.172:8080/api/getProducts?orderBy=codigo&orderDir=desc&pageIndex=1&pageSize=30&searchFor=" + strSearch

                    $.ajax({
                        url: uri,
                        beforeSend: function (request) {
                            vm.products([]);
                            request.setRequestHeader("Authorization", "Negotiate");
                        }
                    }).done(function (data) {
                        if (data && data.recordstotal) {
                            $.each(data.data, (i, item) => {
                                vm.products.push(new product(item));
                            });
                            $("#popupBasic").popup('close');
                        }
                    }).fail(function (jqXHR, textStatus) {
                        alert(jqXHR.responseText);
                        $("#popupBasic").popup('close');
                    });
                }
            });

            $('#localDbChkbox').change(function (e) {

                var checked = $('#localDbChkbox').prop('checked');

                db.sqlBatch([
                    "delete from sgiConfig where name = 'useLocalDb';",
                    ["insert into sgiConfig (name, value) values ('useLocalDb', ?);", [checked]]
                ],
                    function () {
                        console.log('Populated database OK');
                    },
                    function (error) {
                        alert('Transaction ERROR: ' + error.message);
                    });
            });

            $('#btnSync').click(function (e) {
                e.preventDefault();

                let strSearch = '',
                    strSearchFor = '';

                if ($('select option:selected').val()) {
                    strSearchFor = $('select option:selected').val();
                } else {
                    strSearchFor = 'p.nome';
                }

                if ($('#srch-term').val().length) {
                    strSearch = "+and+" + strSearchFor + "+=+'" + $('#srch-term').val() + "'";
                }

                let uri = "http://192.168.25.172:8080/api/getProducts?orderBy=codigo&orderDir=asc&pageIndex=1&pageSize=1000&searchFor=" + strSearch

                let dbItemCount = 0;

                $.ajax({
                    url: uri,
                    beforeSend: function (request) {
                        vm.products([]);
                        request.setRequestHeader("Authorization", "Negotiate");
                    }
                }).done(function (data) {
                    if (data && data.recordstotal) {

                        $.each(data.data, (i, item) => {
                            db.transaction(function (tx) {
                                tx.executeSql('insert or replace into sgiProducts (id, name, price, stock) values ((select id from sgiProducts where id = ?), ?, ?, ?)', [item.codigo, item.nome, item.preco, item.estoque]);
                            },
                                function (error) {
                                    alert('Transaction ERROR: ' + error.message);
                                }, function () {
                                    dbItemCount++;
                                    lastId = 0;
                                    $('#btnSync').text('Sincronizar Produtos (' + dbItemCount + ')');
                                    console.log('Populated database OK');
                                });
                        });
                        // $('#loading').hide();
                    }
                }).fail(function (jqXHR, textStatus) {
                    alert(jqXHR.responseText);
                });
            });

            $('#btnDeleteProducts').click(function (e) {
                e.preventDefault();

                db.transaction(function (tx) {

                    var query = "delete from sgiProducts";

                    tx.executeSql(query, [], function (tx, res) {
                        console.log("rowsAffected: " + res.rowsAffected);
                        $('#btnSync').text('Sincronizar Produtos (0)');
                    },
                        function (tx, error) {
                            alert('DELETE error: ' + error.message);
                        });
                },
                    function (error) {
                        alert('transaction error: ' + error.message);
                    },
                    function () {
                        console.log('transaction ok');
                        $('#btnSync').text('Sincronizar Produtos (0)');
                    });
            });

        });
    };

    function onPause() {
        // TODO: este aplicativo foi suspenso. Salve o estado do aplicativo aqui.
    };

    function onResume() {
        // TODO: este aplicativo foi reativado. Restaure o estado do aplicativo aqui.
    };

    function hideSplash() {
        $.mobile.changePage("#home", "fade");
    };

})();