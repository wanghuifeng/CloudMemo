class ArticlesController < ApplicationController
  def new
    @article = Article.new
  end
  def create
    @article = Article.new(params[:article])
 
    if @article.save
      redirect_to @article
    else
      render 'new'
    end
  end
  def show
  @article = Article.find(params[:id])
end
def index
  @articles = Article.all
end
def edit
  @article = Article.find(params[:id])
end
def update
  @article = Article.find(params[:id])
 
  respond_to do |format|
    if @article.update_attributes(params[:article])
      format.html  { redirect_to(@article,
                    :notice => 'article was successfully updated.') }
      format.json  { head :no_content }
    else
      format.html  { render :action => "edit" }
      format.json  { render :json => @article.errors,
                    :status => :unprocessable_entity }
    end
  end
end
def destroy
  @article = Article.find(params[:id])
  @article.destroy
 
  redirect_to articles_path
end
end
