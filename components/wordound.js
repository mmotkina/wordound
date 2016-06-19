import React from 'react';
import Input from './input';
import Lang from './lang';

const Wordound = React.createClass({
	getInitialState() {
        return {  
			mainWordValue: sessionStorage.getItem('wordound-word') || null,
			findInputValue: null,
			dictionaryKey: 'dict.1.1.20160618T153640Z.8471ffbbc445f0b4.d908fbd6047c36a3f59838b71052e0fb1d93536f',
			dictionaryUrl: 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup?',
			foundedWords: sessionStorage.getItem('wordound-words') && sessionStorage.getItem('wordound-words').split(',') || [],
			meanings: {},
			placeholders: {
				en: {
					mainWordPlaceholder: 'create loong word',
					findInputPlaceholder: 'find the words'
				},
				ru: {
					mainWordPlaceholder: 'придумайте слово',
					findInputPlaceholder: 'подобранное слово'
				}
			},
			lang: 'ru'
        };
    },

    onMainInputChange(evt) {
    	this.setState({
    		mainWordValue: evt.target.value
    	});
    	this.clean();
    	sessionStorage.setItem('wordound-word', evt.target.value.trim());
    },

    onFindInputChange(evt) {
    	this.setState({
    		findInputValue: evt.target.value.toLowerCase().trim()
    	});
    },

    onKeyPress(evt) {
        if (evt.key === 'Enter') {
          	this.validate();
        }
    },

    onLangClick(evt) {
    	this.setState({
    		mainWordValue: null,
    		lang: this.getOtherLang()
    	});
    	this.clean();
    },

    validate() {
    	const word = this.state.findInputValue;
    	let isValid = true;

    	if (this.state.foundedWords.indexOf(word.toLowerCase()) >= 0) {
    		console.log('already exist')
    		return;
    	}

    	for (var i = 0; i < word.length; i++) { 
		 	const letter = word.charAt(i);
		 	const isExist = this.state.mainWordValue.toLowerCase().indexOf(letter.toLowerCase()) >= 0;
		 	console.log('letter', letter, this.state.mainWordValue, isExist)
		 	if (!isExist) {
		 		isValid = false;
		 	}
		}

		if (!isValid) {
			console.log('not match')
			return;
		};
    	this.checkWordExisting();
    },

    checkWordExisting() {
    	$.ajax({
		    url: this.state.dictionaryUrl + 'lang=' + this.state.lang + '-' + this.state.lang + '&key=' + this.state.dictionaryKey + '&text=' + encodeURIComponent(this.state.findInputValue),
		    dataType: 'json',
		    type: 'GET',
		    success: function(data) {
		    	if (data.def) {
		    		if (data.def.length === 0) {
		    			return;
		    		}
		    		console.log('data', data)
		    		this.state.foundedWords = [this.state.findInputValue].concat(this.state.foundedWords);
		    		this.getMeaning(data);
		    		this.setState({
	    				findInputValue: null
	    			});
	    			sessionStorage.setItem('wordound-words', this.state.foundedWords.join(','));
		    	}
		    }.bind(this),
		    error: function(xhr, status, err) {
		    	console.log('Something wrong with request, try again')
		    }.bind(this)
		});
    },

    getMeaning(data) {
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

    	this.state.meanings[this.state.findInputValue] = meanings.join(', ');
    },

    clean() {
    	sessionStorage.removeItem('wordound-word');
    	sessionStorage.removeItem('wordound-words');
    	this.setState({
			foundedWords: []
		});
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

	render() {
		return (
			<div className='wordound'>
				<Lang 
					text={this.getOtherLang()}
					onClick={this.onLangClick} />
				<div className="wordound-input_main">
					<Input 
						value={this.state.mainWordValue}
						placeholder={this.state.placeholders[this.state.lang].mainWordPlaceholder}
						onChange={this.onMainInputChange} />
				</div>
				<div className="wordound-input_found">
					<Input 
						value={this.state.findInputValue}
						placeholder={this.state.placeholders[this.state.lang].findInputPlaceholder}
						onChange={this.onFindInputChange}
						onKeyPress={this.onKeyPress} />
				</div>
				<span className="wordound-counter">{this.state.foundedWords.length}</span>
				<ul className="wordound-list">
					{this.getWordsList()}
				</ul>
			</div>
		);
	}
});

export default Wordound;
