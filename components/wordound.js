import React from 'react';
import Input from './input';
import Lang from './lang';
import words_ru from '../static/words_ru';
import words_en from '../static/words_en';

const Wordound = React.createClass({
    getInitialState() {
        const storageFoundedWords = sessionStorage.getItem('wordound-words');
        return {  
            mainWord: sessionStorage.getItem('wordound-word') || null,
            partWord: null,
            foundedWords: storageFoundedWords ? storageFoundedWords.split(',') : [],
            meanings: {},
            dictionaryKey: 'dict.1.1.20160618T153640Z.8471ffbbc445f0b4.d908fbd6047c36a3f59838b71052e0fb1d93536f',
            dictionaryUrl: 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup?',
            lang: sessionStorage.getItem('wordound-lang') || 'ru',
            copyright: {
                ru: {
                    __html: 'Реализовано с помощью сервиса <a href="https://tech.yandex.ru/dictionary/">Яндекс.Словарь</a>'
                },
                en: {
                    __html: 'Made with <a href="https://tech.yandex.ru/dictionary/">Yandex.Dictionary</a> '
                }
            },
            randomWordTitle: {
                en: 'generate word',
                ru: 'cгенерировать слово'
            },
            placeholders: {
                en: {
                    mainWordPlaceholder: 'create loong word',
                    findInputPlaceholder: 'found word'
                },
                ru: {
                    mainWordPlaceholder: 'придумайте слово',
                    findInputPlaceholder: 'подобранное слово'
                }
            }
        };
    },

    onMainInputChange(evt) {
        const value = evt.target.value.toLowerCase().trim();
        this.saveMainWord(value);
    },

    onFindInputChange(evt) {
        this.setState({
            partWord: evt.target.value.toLowerCase().trim()
        });
    },

    onKeyPress(evt) {
        if (evt.key === 'Enter') {
            this.validate();
        }
    },

    onLangClick(evt) {
        this.clean();
        const lang = this.getOtherLang();
        this.setState({lang});
        sessionStorage.setItem('wordound-lang', lang);
    },

    saveMainWord(word) {
        // clean other fields and session storage
        this.clean();

        // set new value
        this.setState({
            mainWord: word
        });

        // save value to session storage
        sessionStorage.setItem('wordound-word', word);
    },

    validate() {
        const word = this.state.partWord.toLowerCase();
        const mainWord = this.state.mainWord.toLowerCase();
        const foundedWords = this.state.foundedWords;
        let isValid = true;

        if (!word ||
            foundedWords.indexOf(word) >= 0 ||
            word === mainWord) {
            return;
        }

        let mainWordData = {};

        for (var i = 0; i < mainWord.length; i++) { 
            const letterMain = mainWord.charAt(i);
            if (!mainWordData[letterMain]) {
                mainWordData[letterMain] = 1;
            } else {
                mainWordData[letterMain] += 1;
            }
        }

        console.log('mainWord', mainWord)
        console.log('mainWordData', mainWordData)

        for (var i = 0; i < word.length; i++) { 
            const letter = word.charAt(i);

            if (!mainWordData[letter]) {
                console.log('no repeat letters, letter - ', letter);
                console.log('no repeat letters, word - ', word);
                return;
            }
            mainWordData[letter] -= 1;
        }
        this.checkWordExisting();
    },

    checkWordExisting() {
        const url = [
            this.state.dictionaryUrl,
            'lang=',
            this.state.lang,
            '-',
            this.state.lang,
            '&key=',
            this.state.dictionaryKey,
            '&text=',
            encodeURIComponent(this.state.partWord)
        ].join('');

        $.ajax({
            url,
            dataType: 'json',
            type: 'GET',
            success: function(data) {
                if (data.def) {
                    if (data.def.length === 0) {
                        return;
                    }
                    console.log('data', data)
                    const foundedWords = [this.state.partWord].concat(this.state.foundedWords);

                    this.saveMeaning(data);
                    sessionStorage.setItem('wordound-words', foundedWords.join(','));

                    this.setState({
                        foundedWords,
                        partWord: null
                    });
                }
            }.bind(this),
            error: function() {
                console.log('Something wrong with request, try again')
            }
        });
    },

    saveMeaning(data) {
        const meanings = [];

        if (data.def && data.def[0]) {
            data.def[0].tr.map(tr => {
                if (tr.syn) {
                    tr.syn.map(item => {
                        if (meanings.length >= 3) return;
                        meanings.push(item.text);
                    });
                }
            });
        }

        this.state.meanings[this.state.partWord] = meanings.join(', ');
    },

    clean() {
        sessionStorage.removeItem('wordound-word');
        sessionStorage.removeItem('wordound-words');

        this.state.mainWord = null;
        this.state.foundedWords = [];
    },

    getWordsList() {
        return this.state.foundedWords.map((item, index) => {
            const mean = this.state.meanings[item] || '';
            return (
                <li key={index} className="wordound-list_item">
                    {item}
                    <span className='wordound-list_item-info'>{mean}</span>
                </li>
            );
        });
    },

    getOtherLang() {
        return this.state.lang === 'ru' ? 'en' : 'ru';
    },

    getCounter() {
        const foundedWordsLength = this.state.foundedWords.length;
        const lettersLength = this.state.foundedWords.join('').length;
        if (!foundedWordsLength) {
            return null;
        }

        return (
            <span className="wordound-counter">
                  <span className="wordound-counter_words">{foundedWordsLength}</span>
                  <span className="wordound-counter_letters">{lettersLength}</span>
            </span>
        );
    },

    getFindingBlocks() {
        if (!this.state.mainWord) return null;
        return (
            <div className="wordound-panel">
                <div className="wordound-input_found">
                    <Input 
                    value={this.state.partWord}
                    placeholder={this.state.placeholders[this.state.lang].findInputPlaceholder}
                    onChange={this.onFindInputChange}
                    onKeyPress={this.onKeyPress} />
                </div>
                {this.getCounter()}
                <ul className="wordound-list">
                    {this.getWordsList()}
                </ul>
            </div>
        );
    },

    setRandomWord() {
        const words = (this.state.lang === 'ru') ? words_ru : words_en;
        const index = Math.floor(Math.random() * (words.length - 1 + 1)) + 1;
        this.saveMainWord(words[index]);
    },

    getRandomBlock() {
        return (
            <span className="wordound-random">
                <span onClick={this.setRandomWord} className="wordound-random-word">{this.state.randomWordTitle[this.state.lang]}</span>
            </span>
        );
    },

    render() {
        return (
            <div className='wordound'>
                <div className="wordound-header">
                    <h1 className="wordound-logo">wordound</h1>
                    <span className="wordound-menu">
                        <span className="copyright" dangerouslySetInnerHTML={this.state.copyright[this.state.lang]}></span>
                        <Lang 
                            text={this.getOtherLang()}
                            onClick={this.onLangClick} />
                    </span>
                </div>
                {this.getRandomBlock()}
                <div className="wordound-input_main">
                    <Input 
                        value={this.state.mainWord}
                        placeholder={this.state.placeholders[this.state.lang].mainWordPlaceholder}
                        onChange={this.onMainInputChange} />
                </div>
                {this.getFindingBlocks()}
            </div>
        );
    }
});

export default Wordound;
