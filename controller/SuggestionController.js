//Require dependencies
const SuggestionModel = require('../model/SuggestionModel');
let helper = require('../utils/helper');

class SuggestionController {
    /**
     * Create a new Suggestion
     * @param content - Content of the suggestion
     * @param creator - User object of the creator of the Suggestion
     * @param notificationId - Id of the notification message sent to discord
     * @returns {Promise}
     */
    async createSuggestion(content, creator, notificationId) {
        let currentAmount = await SuggestionModel.count();
        let suggestion = new SuggestionModel({
            id: currentAmount + 1,
            creator: helper.getUserNameDiscrim(creator),
            creatorId: creator.id,
            notificationId,
            content
        });
        return suggestion.save();
    }

    /**
     * Get a suggestion via id
     * @param id - Id of the suggestion
     * @returns {Promise}
     */
    async getSuggestion(id) {
        return SuggestionModel.findOne({id});
    }

    /**
     * Accept a suggestion
     * @param id - id of the suggestion
     * @param moderator - User Object of the moderator that accepted this suggestion
     * @returns {Promise}
     */
    async acceptSuggestion(id, moderator) {
        return this.updateSuggestionState(id, moderator, 'accept');
    }

    /**
     * Decline a suggestion
     * @param id - id of the suggestion
     * @param moderator - User Object of the moderator that declined the suggestion
     * @returns {Promise}
     */
    async declineSuggestion(id, moderator) {
        return this.updateSuggestionState(id, moderator, 'deny')
    }

    /**
     * Updates the state and the moderator of a suggestion
     * @param id - id of the suggestion
     * @param moderator - the User Object of the moderator that changed the state of the suggestion
     * @param state - the new State, could be either accept or deny
     * @returns {Promise}
     */
    async updateSuggestionState(id, moderator, state) {
        return SuggestionModel.updateOne({id}, {$set: {modId: moderator.id,moderator:helper.getUserNameDiscrim(moderator), state}})
    }

    /**
     * Get a list of suggestions paginated in 10 result batches
     * @param page - The page to load (pages start at 0)
     * @returns {Promise}
     */
    async listSuggestion(page = 0) {
        return await SuggestionModel.find().sort({id: -1}).skip(page * 10)
            .limit(10);
    }

    /**
     * Get the amount of pages that are currently available
     * @returns {Promise}
     */
    async maxSuggestionPage() {
        let suggestionCount = await SuggestionModel.count();
        return Math.ceil(suggestionCount / 10);
    }
}

module.exports = SuggestionController;
